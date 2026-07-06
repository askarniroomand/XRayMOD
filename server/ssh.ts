import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

export async function setupNode(node: any) {
  try {
    await ssh.connect({
      host: node.ip,
      username: node.ssh_user,
      port: node.ssh_port,
      password: node.ssh_password,
      privateKey: node.ssh_key
    });

    console.log(`Connected to ${node.ip}`);

    // Install Xray and BBR
    const commands = [
      'bash <(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)',
      'echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf',
      'echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf',
      'sysctl -p',
      'mkdir -p /etc/xray/configs'
    ];

    for (const cmd of commands) {
      const result = await ssh.execCommand(cmd);
      console.log(`STDOUT: ${result.stdout}`);
      if (result.stderr) console.error(`STDERR: ${result.stderr}`);
    }

    return { success: true };
  } catch (error) {
    console.error(`SSH Error: ${error}`);
    return { success: false, error };
  } finally {
    ssh.dispose();
  }
}
