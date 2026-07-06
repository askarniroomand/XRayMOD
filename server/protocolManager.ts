import Database from "better-sqlite3";
import path from "path";

const db = new Database("panel.db");

export const getProtocols = () => {
  return db.prepare("SELECT * FROM protocols").all().map(p => ({
    ...p,
    schema: JSON.parse(p.schema)
  }));
};

export const addProtocol = (id: string, name: string, schema: any, template: string) => {
  return db.prepare("INSERT OR REPLACE INTO protocols (id, name, schema, template) VALUES (?, ?, ?, ?)")
    .run(id, name, JSON.stringify(schema), template);
};

export const generateConfig = (protocolId: string, user: any, settings: any) => {
  const protocol = db.prepare("SELECT * FROM protocols WHERE id = ?").get(protocolId);
  if (!protocol) throw new Error("Protocol not found");

  let template = protocol.template;
  const data = { ...settings, uuid: user.uuid };

  // Simple template engine
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    template = template.replace(regex, data[key]);
  });

  return JSON.parse(template);
};
