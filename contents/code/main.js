/*
# vim:tabstop=4:shiftwidth=4:noexpandtab
*/

function isAlacritty(client) {
	return client && !client.deleted && client.normalWindow && client.resourceName.toString() === "alacritty";
}

function findAlacritty() {
	let clients = workspace.windowList();
	return clients.find(client => isAlacritty(client)) || null;
}

function isVisible(client) {
	return !client.minimized;
}

function isActive(client) {
	return client === workspace.activeWindow;
}

function activate(client) {
	workspace.activeWindow = client;
}

function setupClient(client) {
	print("setupClient");
	client.onAllDesktops = true;
	client.skipTaskbar = true;
	client.skipSwitcher = true;
	client.skipPager = true;
	client.keepAbove = true;
	// client.setMaximize(true, true);
	client.fullScreen = false;
	printClient(client);
}

function printClient(client) {
	print("resourceName=" + client.resourceName.toString() +
		";normalWindow=" + client.normalWindow +
		";onAllDesktops=" + client.onAllDesktops +
		";skipTaskbar=" + client.skipTaskbar +
		";skipSwitcher=" + client.skipSwitcher +
		";skipPager=" + client.skipPager +
		";keepAbove=" + client.keepAbove +
		";fullScreen=" + client.fullScreen +
		"");
}

function getCursorScreen() {
	// Get current mouse position
	var cursorPos = workspace.cursorPos;
	var targetScreen = -1;
	// Check each screen's geometry to find where the cursor is
	for (var i = 0; i < workspace.screens.length; ++i) {
		var screenGeom = workspace.clientArea(KWin.ScreenArea, workspace.screens[i], workspace.currentDesktop);
		if (cursorPos.x >= screenGeom.x && cursorPos.x < screenGeom.x + screenGeom.width &&
			cursorPos.y >= screenGeom.y && cursorPos.y < screenGeom.y + screenGeom.height) {
			targetScreen = workspace.screens[i];
			break;
		}
	}
	return targetScreen;
}

function moveclientToScreen(client, targetScreen) {
	if (client && client.moveable) {
		// Move the window if target screen is valid and different from current
		if (targetScreen !== -1 && targetScreen !== client.screen) {
			workspace.sendClientToScreen(client, targetScreen);
		}
	}
}

function show(client) {

	client.minimized = false;
}

function hide(client) {
	client.minimized = true;
}

function toggleAlacritty() {
	let alacritty = findAlacritty();
	if (alacritty) {
		var screen = getCursorScreen();
		moveclientToScreen(alacritty, screen);
		if (isVisible(alacritty)) {
			if (isActive(alacritty)) {
				hide(alacritty);
			} else {
				activate(alacritty);
			}
		} else {
			show(alacritty);
			activate(alacritty);
		}
	}
}

function setupAlacritty(client) {
	if (isAlacritty(client)) {
		setupClient(client);
		printClient(client);
	}
}

function init() {
	let alacritty = findAlacritty();
	if (alacritty) {
		setupClient(alacritty);
	}

	workspace.windowAdded.connect(setupAlacritty);
	registerShortcut("Alacritty Toggle", "Toggle Alacritty open/closed.", "Meta+F12", toggleAlacritty);
}

init();