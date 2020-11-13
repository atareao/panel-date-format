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

class CustomClockDisplay{
    constructor(){
        this._originalClockDisplay = main.panel.statusArea.dateMenu._clockDisplay;
        this._formatClockDisplay = new St.Label({
            y_align: Clutter.ActorAlign.CENTER,
        });
        this._settings = ExtensionUtils.getSettings();
        this._setting.connect('changed', this._setFormat.bind(this));
        this._setFormat();
        this._timeoutID = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, ()=>{
            this._formatClockDisplay.set_text(
                GLib.DateTime.new_now_local().format(this._format));
            return true;
        });
    }

    _setFormat(){
        if (!this._settings.get_string('format')) {
            this._format = '%Y.%m.%d %H:%M';
        }else{
            this._format = this._settings.get_string('format');
        }
    }

    disable(){
        if(this._timeoutID > 0){
            GLib.Source.remove(this._timeoutID);
            this._timeoutID = 0;
        }
        this._originalClockDisplay.get_parent().remove_child(
            this._formatClockDisplay);
        this._originalClockDisplay.show();

}

let customClockDisplay;

function init() {
    Convenience.initTranslations();
}

function enable() {
    customClockDisplay = new CustomClockDisplay();
}

function disable() {
    customClockDisplay.disable();
}
