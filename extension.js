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

const {GLib, St, Clutter, GnomeDesktop} = imports.gi;
const main = imports.ui.main;
const ExtensionUtils = imports.misc.extensionUtils;

class CustomClockDisplay{
    constructor(){
        this._originalClockDisplay = main.panel.statusArea.dateMenu._clockDisplay;
        this._formatClockDisplay = new St.Label({
            y_align: Clutter.ActorAlign.CENTER,
        });
        this._settings = ExtensionUtils.getSettings();
        this._originalClockDisplay.hide();
        this._originalClockDisplay.get_parent().insert_child_below(
            this._formatClockDisplay,
            this._originalClockDisplay);
        this._wallClock = new GnomeDesktop.WallClock({timeOnly: true});
        this._updateClockId = this._wallClock.connect("notify::clock", this.updateClock.bind(this));
        this._formatChangedId = this._settings.connect("changed", this._setFormat.bind(this));
        this._setFormat();
    }

    _setFormat(){
        if (!this._settings.get_string('format')) {
            this._format = '%Y.%m.%d %H:%M';
        }else{
            this._format = this._settings.get_string('format');
        }
        this.updateClock();
    }

    updateClock(){
        this._formatClockDisplay.set_text(
            GLib.DateTime.new_now_local().format(this._format));
    }

    destroy(){
        if(this._updateClockId){
            this._wallClock.disconnect(this._updateClockId);
            this._updateClockId = null;
        }
        if(this._formatChangedId){
            this._settings.disconnect(this._formatChangedId);
            this._formatChangedId = null;
        }
        this._wallClock.run_dispose();
        this._originalClockDisplay.get_parent().remove_child(
            this._formatClockDisplay);
        this._originalClockDisplay.show();
    }
}

let customClockDisplay;

function init() {
}

function enable() {
    customClockDisplay = new CustomClockDisplay();
}

function disable() {
    customClockDisplay.destroy();
    customClockDisplay = null;
}
