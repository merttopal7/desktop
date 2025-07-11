export async function minimizeWindow() {
  await window.electronWindow.minimize();
}
export async function maximizeWindow() {
  await window.electronWindow.maximize();
}
export async function closeWindow() {
  await window.electronWindow.close();
}
export async function exportLicense(payload = []) {
  await window.electronWindow.exportLicense(payload);
}
