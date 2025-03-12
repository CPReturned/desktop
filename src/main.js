const {app, BrowserWindow, autoUpdater} = require("electron");
const path = require("path");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) app.quit();

if (process.platform !== "darwin") require("update-electron-app")({ repo: "CPReturned/desktop" });

const ALLOWED_ORIGINS = [
    "https://cpreturned.com",
    "https://cpreturned.test"
];

const pluginPaths = {
    win32: path.join(path.dirname(__dirname), "lib/pepflashplayer.dll"),
    darwin: path.join(path.dirname(__dirname), "lib/PepperFlashPlayer.plugin"),
    linux: path.join(path.dirname(__dirname), "lib/libpepflashplayer.so"),
};


if (process.platform === "linux") app.commandLine.appendSwitch("no-sandbox");
const pluginName = pluginPaths[process.platform];
console.log("pluginName", pluginName);

app.commandLine.appendSwitch("ppapi-flash-path", pluginName);
app.commandLine.appendSwitch("ppapi-flash-version", "31.0.0.122");
app.commandLine.appendSwitch("ignore-certificate-errors");

let mainWindow;
const createWindow = () => {
    mainWindow = new BrowserWindow({
        autoHideMenuBar: true,
        useContentSize: true,
        show: false,
        webPreferences: {
            plugins: true,
        },
        title: 'Club Penguin Returned'
    });

    mainWindow.webContents.on("will-navigate", (event, urlString) => {
        if (!ALLOWED_ORIGINS.includes(new URL(urlString).origin)) {
            event.preventDefault();
        }
    });
    app.on('before-quit', (e) => {
        mainWindow.destroy()
    })
    mainWindow.on("closed", () => (mainWindow = null));

    mainWindow.webContents.session.clearHostResolverCache();

    // You're welcome to visit this online if you're having a browse through the code.
    // With that said, you'll only see what you'll already see on the desktop client.
    mainWindow.loadURL("https://play.cpreturned.com/#/login");

    mainWindow.once("ready-to-show", () => {
        mainWindow.show();
    });
};

const launchMain = () => {
    // Disallow multiple clients running
    if (!app.requestSingleInstanceLock()) return app.quit();
    app.on("second-instance", (_event, _commandLine, _workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
    app.setAsDefaultProtocolClient("cpreturned");

    app.whenReady().then(() => {
        createWindow();

        app.on("activate", () => {
            // On OS X it's common to re-create a window in the app when the
            // dock icon is clicked and there are no other windows open.
            if (BrowserWindow.getAllWindows().length === 0) {
                createWindow();
            }
        });
    })

    // Quit when all windows are closed, except on macOS. There, it's common
    // for applications and their menu bar to stay active until the user quits
    // explicitly with Cmd + Q.
    app.on("window-all-closed", () => {
        if (process.platform !== "darwin") {
            app.quit();
        }
    });
}

launchMain();
