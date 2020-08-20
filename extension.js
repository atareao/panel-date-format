/*
 * This file is part panel-date-format
 *
 * Copyright (c) 2020 Lorenzo Carbonell Cerezo <a.k.a. atareao>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

const GLib = imports.gi.GLib;
const St = imports.gi.St;
const main = imports.ui.main;
const Clutter = imports.gi.Clutter;
const ExtensionUtils = imports.misc.extensionUtils;
const Extension = ExtensionUtils.getCurrentExtension();
const Convenience = Extension.imports.convenience;

let originalClockDisplay;
let formatClockDisplay;
let settings;
let timeoutID = 0;

/**
 * Initialising function which will be invoked at most once directly after your source JS file is loaded.
 */
function init() {
  originalClockDisplay = main.panel.statusArea.dateMenu._clockDisplay;
  formatClockDisplay = new St.Label({
    y_align: Clutter.ActorAlign.CENTER,
  });
  settings = Convenience.getSettings();

  // FIXME: Set settings first time to make it visible in dconf Editor
  if (!settings.get_string('format')) {
    settings.set_string('format', '%Y.%m.%d %H:%M');
  }
}

/**
 * Enable, called when extension is enabled or when screen is unlocked.
 */
function enable() {
  originalClockDisplay.hide();
  originalClockDisplay.get_parent().insert_child_below(formatClockDisplay, originalClockDisplay);
  timeoutID = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, tick);
}

/**
 * Disable, called when extension is disabled or when screen is locked.
 */
function disable() {
  GLib.Source.remove(timeoutID);
  timeoutID = 0;
  originalClockDisplay.get_parent().remove_child(formatClockDisplay);
  originalClockDisplay.show();
}

/**
 * It runs every time we need to update clock.
 * @return {boolean} Always returns true to loop.
 */
function tick() {
  const format = settings.get_string('format');
  formatClockDisplay.set_text(new Date().toLocaleFormat(format));

  return true;
}
