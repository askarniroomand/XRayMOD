"""
XrayMOD Telegram Bot
--------------------
Always-on bot that lets users create / list / delete / update Cloudflare panels.

Setup:
  1. python3 -m venv .venv && source .venv/bin/activate
  2. pip install -r requirements.txt
  3. cp .env.example .env  → set BOT_TOKEN
  4. python bot.py

Requires on the host: node, npm, git, wrangler (via npx).
"""

from __future__ import annotations

import asyncio
import logging
import os
import re
import secrets
from pathlib import Path

from dotenv import load_dotenv
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import (
    Application,
    CallbackQueryHandler,
    CommandHandler,
    ContextTypes,
    ConversationHandler,
    MessageHandler,
    filters,
)

from db import delete_panel, init_db, list_panels, save_panel
from deploy import create_panel, destroy_panel, update_panel

load_dotenv()

logging.basicConfig(
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    level=logging.INFO,
)
log = logging.getLogger("xraymod-bot")

BOT_TOKEN = os.getenv("BOT_TOKEN", "").strip()
REPO_URL = os.getenv("REPO_URL", "https://github.com/askarniroomand/XRayMOD.git").strip()
WORK_ROOT = Path(os.getenv("WORK_ROOT", str(Path.home() / ".xraymod-bot"))).expanduser()
ALLOWLIST = {
    int(x.strip())
    for x in os.getenv("ALLOW_USER_IDS", "").split(",")
    if x.strip().isdigit()
}

TOKEN, USER, PASS = range(3)


def allowed(user_id: int | None) -> bool:
    if not ALLOWLIST:
        return True
    return bool(user_id and user_id in ALLOWLIST)


def main_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        [
            [InlineKeyboardButton("➕ ساخت پنل جدید", callback_data="create")],
            [InlineKeyboardButton("📦 پنل‌های من", callback_data="list")],
            [InlineKeyboardButton("🔄 آپدیت همه از GitHub", callback_data="update_all")],
            [InlineKeyboardButton("❓ راهنما", callback_data="help")],
        ]
    )


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user = update.effective_user
    if not allowed(user.id if user else None):
        await update.effective_message.reply_text("دسترسی ندارید.")
        return
    await update.effective_message.reply_text(
        "سلام — ربات ساخت پنل *XrayMOD*\n\n"
        "توکن Cloudflare بده → یوزر/رمز → پنل ساخته می‌شود.\n"
        "چند پنل بساز، حذف کن، یا با یک دکمه آخرین کد GitHub را deploy کن.",
        parse_mode="Markdown",
        reply_markup=main_kb(),
    )


async def help_cb(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    q = update.callback_query
    await q.answer()
    await q.edit_message_text(
        "۱) ساخت پنل: توکن CF با دسترسی Workers + D1\n"
        "۲) چند پنل روی یک اکانت با نام Worker جدا\n"
        "۳) حذف: Worker + D1 مربوطه پاک می‌شود\n"
        "۴) آپدیت: `git pull` آخرین main + rebuild + redeploy\n\n"
        "توکن را فقط در چت خصوصی بفرست.",
        reply_markup=main_kb(),
    )


async def list_cb(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    q = update.callback_query
    await q.answer()
    uid = q.from_user.id
    panels = list_panels(uid)
    if not panels:
        await q.edit_message_text("هنوز پنلی نداری.", reply_markup=main_kb())
        return
    lines = []
    rows = []
    for p in panels:
        lines.append(
            f"• `{p['worker_name']}`\n"
            f"  {p['login_url']}\n"
            f"  `{p['username']}` / `{p['password']}`"
        )
        rows.append(
            [
                InlineKeyboardButton(
                    f"🗑 حذف {p['worker_name']}", callback_data=f"del:{p['id']}"
                )
            ]
        )
        rows.append(
            [
                InlineKeyboardButton(
                    f"🔄 آپدیت {p['worker_name']}", callback_data=f"upd:{p['id']}"
                )
            ]
        )
    rows.append([InlineKeyboardButton("⬅️ منو", callback_data="menu")])
    await q.edit_message_text(
        "پنل‌های تو:\n\n" + "\n\n".join(lines),
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup(rows),
        disable_web_page_preview=True,
    )


async def menu_cb(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    q = update.callback_query
    await q.answer()
    await q.edit_message_text("منوی اصلی:", reply_markup=main_kb())


async def create_start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    q = update.callback_query
    await q.answer()
    if not allowed(q.from_user.id):
        await q.edit_message_text("دسترسی ندارید.")
        return ConversationHandler.END
    context.user_data.clear()
    await q.edit_message_text(
        "Cloudflare API Token را بفرست:\n"
        "(Edit Cloudflare Workers / D1)\n\n"
        "/cancel برای انصراف"
    )
    return TOKEN


async def got_token(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    token = (update.message.text or "").strip()
    if len(token) < 20:
        await update.message.reply_text("توکن کوتاه است — دوباره بفرست یا /cancel")
        return TOKEN
    context.user_data["cf_token"] = token
    try:
        await update.message.delete()
    except Exception:
        pass
    await update.message.reply_text("نام کاربری پنل؟ (مثلاً admin)")
    return USER


async def got_user(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    username = (update.message.text or "").strip()
    if not re.match(r"^[\w.-]{3,32}$", username):
        await update.message.reply_text("نامعتبر — ۳ تا ۳۲ کاراکتر لاتین/عدد")
        return USER
    context.user_data["username"] = username
    await update.message.reply_text("رمز عبور؟ (خالی = خودکار → یک نقطه بفرست: `.`)")
    return PASS


async def got_pass(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    raw = (update.message.text or "").strip()
    password = secrets.token_urlsafe(12) if raw in {".", "-", ""} else raw
    if len(password) < 6:
        await update.message.reply_text("رمز حداقل ۶ کاراکتر")
        return PASS
    context.user_data["password"] = password
    try:
        await update.message.delete()
    except Exception:
        pass

    msg = await update.message.reply_text(
        "⏳ در حال ساخت پنل… (چند دقیقه)\ngit + npm + wrangler"
    )

    token = context.user_data["cf_token"]
    username = context.user_data["username"]
    short = secrets.token_hex(3)
    worker_name = f"xraymod-{short}"

    try:
        result = await asyncio.to_thread(
            create_panel,
            token=token,
            username=username,
            password=password,
            worker_name=worker_name,
            work_root=WORK_ROOT,
            repo_url=REPO_URL,
        )
    except Exception as e:
        log.exception("create failed")
        await msg.edit_text(f"❌ ساخت ناموفق:\n`{e}`", parse_mode="Markdown")
        return ConversationHandler.END

    save_panel(
        tg_user_id=update.effective_user.id,
        worker_name=result["worker_name"],
        d1_id=result["d1_id"],
        account_id=result["account_id"],
        panel_url=result["panel_url"],
        login_url=result["login_url"],
        username=username,
        password=password,
        access_uuid=result["access_uuid"],
        cf_token=token,
        sub_url=result.get("sub_url", ""),
    )

    text = (
        "✅ *پنل آماده شد*\n\n"
        f"Worker: `{result['worker_name']}`\n"
        f"یوزر: `{username}`\n"
        f"رمز: `{password}`\n"
        f"Access UUID: `{result['access_uuid']}`\n\n"
        f"ورود:\n{result['login_url']}\n\n"
        f"پنل:\n{result['panel_url']}\n"
    )
    if result.get("sub_url"):
        text += f"\nساب:\n{result['sub_url']}\n"
    text += "\n_لینک را خصوصی نگه دار._"

    await msg.edit_text(text, parse_mode="Markdown", disable_web_page_preview=True, reply_markup=main_kb())
    context.user_data.clear()
    return ConversationHandler.END


async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    context.user_data.clear()
    await update.message.reply_text("لغو شد.", reply_markup=main_kb())
    return ConversationHandler.END


async def delete_cb(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    q = update.callback_query
    await q.answer()
    pid = int(q.data.split(":", 1)[1])
    panels = list_panels(q.from_user.id)
    panel = next((p for p in panels if p["id"] == pid), None)
    if not panel:
        await q.edit_message_text("پیدا نشد.", reply_markup=main_kb())
        return
    await q.edit_message_text(f"⏳ حذف `{panel['worker_name']}`…", parse_mode="Markdown")
    try:
        await asyncio.to_thread(destroy_panel, panel)
        delete_panel(pid, q.from_user.id)
        await q.edit_message_text("✅ حذف شد.", reply_markup=main_kb())
    except Exception as e:
        await q.edit_message_text(f"❌ حذف ناموفق: `{e}`", parse_mode="Markdown", reply_markup=main_kb())


async def update_one_cb(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    q = update.callback_query
    await q.answer()
    pid = int(q.data.split(":", 1)[1])
    panels = list_panels(q.from_user.id)
    panel = next((p for p in panels if p["id"] == pid), None)
    if not panel:
        await q.edit_message_text("پیدا نشد.", reply_markup=main_kb())
        return
    await q.edit_message_text(f"⏳ آپدیت `{panel['worker_name']}` از GitHub…", parse_mode="Markdown")
    try:
        url = await asyncio.to_thread(update_panel, panel, WORK_ROOT, REPO_URL)
        await q.edit_message_text(
            f"✅ آپدیت شد\n{url}",
            reply_markup=main_kb(),
            disable_web_page_preview=True,
        )
    except Exception as e:
        await q.edit_message_text(f"❌ آپدیت ناموفق: `{e}`", parse_mode="Markdown", reply_markup=main_kb())


async def update_all_cb(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    q = update.callback_query
    await q.answer()
    panels = list_panels(q.from_user.id)
    if not panels:
        await q.edit_message_text("پنلی نیست.", reply_markup=main_kb())
        return
    await q.edit_message_text(f"⏳ آپدیت {len(panels)} پنل از GitHub main…")
    ok_n = 0
    errors = []
    for p in panels:
        try:
            await asyncio.to_thread(update_panel, p, WORK_ROOT, REPO_URL)
            ok_n += 1
        except Exception as e:
            errors.append(f"{p['worker_name']}: {e}")
    text = f"✅ {ok_n}/{len(panels)} آپدیت شد."
    if errors:
        text += "\n\nخطاها:\n" + "\n".join(f"• {e}" for e in errors[:5])
    await q.edit_message_text(text, reply_markup=main_kb())


def build_app() -> Application:
    if not BOT_TOKEN:
        raise SystemExit("BOT_TOKEN missing — set in .env")

    init_db()
    app = Application.builder().token(BOT_TOKEN).build()

    conv = ConversationHandler(
        entry_points=[CallbackQueryHandler(create_start, pattern="^create$")],
        states={
            TOKEN: [MessageHandler(filters.TEXT & ~filters.COMMAND, got_token)],
            USER: [MessageHandler(filters.TEXT & ~filters.COMMAND, got_user)],
            PASS: [MessageHandler(filters.TEXT & ~filters.COMMAND, got_pass)],
        },
        fallbacks=[CommandHandler("cancel", cancel)],
        allow_reentry=True,
    )

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("cancel", cancel))
    app.add_handler(conv)
    app.add_handler(CallbackQueryHandler(help_cb, pattern="^help$"))
    app.add_handler(CallbackQueryHandler(list_cb, pattern="^list$"))
    app.add_handler(CallbackQueryHandler(menu_cb, pattern="^menu$"))
    app.add_handler(CallbackQueryHandler(delete_cb, pattern=r"^del:\d+$"))
    app.add_handler(CallbackQueryHandler(update_one_cb, pattern=r"^upd:\d+$"))
    app.add_handler(CallbackQueryHandler(update_all_cb, pattern="^update_all$"))
    app.add_handler(CallbackQueryHandler(create_start, pattern="^create$"))
    return app


def main() -> None:
    app = build_app()
    log.info("XrayMOD bot running…")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
