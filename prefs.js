/*
 * This file is part of panel-date-format
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

const {GLib, GObject, Gio, Gtk, Gdk} = imports.gi; 
const ExtensionUtils = imports.misc.extensionUtils;
const Extension = ExtensionUtils.getCurrentExtension();
const PreferencesWidget = Extension.imports.preferenceswidget;
const Gettext = imports.gettext.domain(Extension.uuid);
const _ = Gettext.gettext;

function init(){
    ExtensionUtils.initTranslations();
}

var AboutWidget = GObject.registerClass(
    class AboutWidget extends Gtk.Grid{
        _init(settings) {
            super._init({
                margin_bottom: 18,
                row_spacing: 8,
                hexpand: true,
                halign: Gtk.Align.CENTER,
                orientation: Gtk.Orientation.VERTICAL
            });

            let aboutIcon = new Gtk.Image({
                icon_name: "panel-date-format",
                pixel_size: 128
            });
            this.add(aboutIcon);

            let aboutName = new Gtk.Label({
                label: "<b>" + _("Panel Date Format") + "</b>",
                use_markup: true
            });
            this.add(aboutName);

            let aboutVersion = new Gtk.Label({ label: _('Version: ') + Extension.metadata.version.toString() });
            this.add(aboutVersion);

            let aboutDescription = new Gtk.Label({
                label:  Extension.metadata.description
            });
            this.add(aboutDescription);

            let aboutWebsite = new Gtk.Label({
                label: '<a href="%s">%s</a>'.format(
                    Extension.metadata.url,
                    _("Atareao")
                ),
                use_markup: true
            });
            this.add(aboutWebsite);

            let aboutCopyright = new Gtk.Label({
                label: "<small>" + _('Copyright © 2020 Lorenzo Carbonell') + "</small>",
                use_markup: true
            });
            this.add(aboutCopyright);

            let aboutLicense = new Gtk.Label({
                label: "<small>" +
                _("THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n") + 
                _("IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n") + 
                _("FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n") + 
                _("AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n") + 
                _("LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING\n") + 
                _("FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS\n") + 
                _("IN THE SOFTWARE.\n") + 
                "</small>",
                use_markup: true,
                justify: Gtk.Justification.CENTER
            });
            this.add(aboutLicense);
        }
    }
);

var PanelDateFOrmatPreferencesWidget = GObject.registerClass(
    class PanelDateFOrmatPreferencesWidget extends PreferencesWidget.Stack{
        _init(settings){
            super._init();

            Gtk.IconTheme.get_default().append_search_path(
                Extension.dir.get_child('icons').get_path());

            let preferencesPage = new PreferencesWidget.Page();
            this.add_titled(preferencesPage, "preferences", _("Preferences"));

            var settings = ExtensionUtils.getSettings();
            let appearanceSection = preferencesPage.addSection(
                _("Select options"), null, {});

            this.format = new PreferencesWidget.StringSetting(settings, 'format');
            let key = settings.settings_schema.get_key('format');
            appearanceSection.addSetting(
                key.get_summary(),
                key.get_description(),
                this.format);

            let infoSection = preferencesPage.addSection(
                _("Information"), null, {});
            let url = "https://lazka.github.io/pgi-docs/#GLib-2.0/classes/DateTime.html#GLib.DateTime.format";
            infoSection.addSetting(
                _("Syntax"),
                url,
                Gtk.LinkButton.new_with_label(url, _('Date time format'))
            );
            let date = GLib.DateTime.new_now_local();
            let button1 = Gtk.Button.new_with_label(_('Set'));
            this._createSample(infoSection, date,
                               _('The preferred date and time representation for the current locale'),
                               '%c');
            this._createSample(infoSection, date,
                               _('The preferred date representation for the current locale without the time'),
                               '%x');
            this._createSample(infoSection, date,
                               _('The preferred time representation for the current locale without the date'),
                               '%X');
            this._createSample(infoSection, date,
                               _('Day, month and hour'),
                               '%A, %e de %B %R');
            this._createSample(infoSection, date,
                               _('the number of seconds since the Epoch'),
                               '%s');
            this._createSample(infoSection, date,
                               _('The time in 24-hour notation with seconds'),
                               '%H:%M:%S');
            this._createSample(infoSection, date,
                               _('The time in 24-hour notation'),
                               '%R');

            let aboutPage = this.addPage(
                "about",
                _("About"),
                { vscrollbar_policy: Gtk.PolicyType.NEVER }
            );
            aboutPage.box.add(new AboutWidget());
            aboutPage.box.margin_top = 18;
        }

        _createSample(section, date, text, format){
            let button = Gtk.Button.new_with_label(format);
            section.addSetting(
                text,
                date.format(format),
                button
            );
            button.connect('clicked', ()=>{
                this.format.set_text(format);
            });
        }
    }
);

function center(window){
    let defaultDisplay = Gdk.Display.get_default();
    let monitor = defaultDisplay.get_primary_monitor();
    let scale = monitor.get_scale_factor();
    let monitor_width = monitor.get_geometry().width / scale;
    let monitor_height = monitor.get_geometry().height / scale;
    let width = window.get_preferred_width()[0];
    let height = window.get_preferred_height()[0];
    window.move((monitor_width - width)/2, (monitor_height - height)/2);
}

function buildPrefsWidget() {
    let preferencesWidget = new PanelDateFOrmatPreferencesWidget();
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 0, () => {
        let prefsWindow = preferencesWidget.get_toplevel()
        prefsWindow.get_titlebar().custom_title = preferencesWidget.switcher;
        center(prefsWindow);
        return false;
    });
    preferencesWidget.show_all();
    return preferencesWidget;
}
