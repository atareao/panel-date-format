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

const {GLib, St, Clutter} = imports.gi;
const main = imports.ui.main;
const ExtensionUtils = imports.misc.extensionUtils;
const Extension = ExtensionUtils.getCurrentExtension();
const Convenience = Extension.imports.convenience;

let originalClockDisplay;
let formatClockDisplay;
let settings;
let timeoutID = 0;
let format;

/**
 * Initialising function which will be invoked at most once directly after your source JS file is loaded.
 */

function setFormat(){
    if (!settings.get_string('format')) {
        format = '%Y.%m.%d %H:%M';
    }else{
        format = settings.get_string('format');
    }
}

function init() {
    originalClockDisplay = main.panel.statusArea.dateMenu._clockDisplay;
    formatClockDisplay = new St.Label({
        y_align: Clutter.ActorAlign.CENTER,
    });
    settings = Convenience.getSettings();
    setFormat();
    settings.connect('changed', setFormat);
}

function enable() {
    originalClockDisplay.hide();
    originalClockDisplay.get_parent().insert_child_below(formatClockDisplay, originalClockDisplay);
    if(timeoutID > 0){
        GLib.Source.remove(timeoutID);
        timeoutID = 0;
    }
    timeoutID = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, tick);
}

function disable() {
    if(timeoutID > 0){
        GLib.Source.remove(timeoutID);
        timeoutID = 0;
    }
    originalClockDisplay.get_parent().remove_child(formatClockDisplay);
    originalClockDisplay.show();
}

function tick() {
    formatClockDisplay.set_text(GLib.DateTime.new_now_local().format(format));
    return true;
}
