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
const Widgets = Extension.imports.preferenceswidget;
const AboutPage = Extension.imports.aboutpage.AboutPage;
const Gettext = imports.gettext.domain(Extension.uuid);
const _ = Gettext.gettext;

function init(){
    ExtensionUtils.initTranslations();
}

var PanelDateFOrmatPreferencesWidget = GObject.registerClass(
    class PanelDateFOrmatPreferencesWidget extends Widgets.ListWithStack{
        _init(){
            super._init({});

            /*
            let theme = Gtk.IconTheme.get_default();
            if (theme == null) {
                // Workaround due to lazy initialization on wayland
                // as proposed by @fmuellner in GNOME mutter issue #960
                theme = new Gtk.IconTheme();
                theme.set_custom_theme(St.Settings.get().gtk_icon_theme);
            }
            */

            var settings = ExtensionUtils.getSettings();
            let preferencesPage = new Widgets.Page();

            let appearanceSection = preferencesPage.addFrame(
                _("Select options"));

            this.format = new Widgets.StringSetting(settings, 'format');
            let key = settings.settings_schema.get_key('format');
            appearanceSection.addSetting(
                key.get_summary(),
                key.get_description(),
                this.format);

            let infoSection = preferencesPage.addFrame(
                _("Information"));

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

            this.add(_("Panel Date Format Preferences"), "preferences-other-symbolic",
                preferencesPage);
            this.add(_("About"), "help-about-symbolic", new AboutPage());
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

function buildPrefsWidget() {
    let preferencesWidget = new PanelDateFOrmatPreferencesWidget();
    preferencesWidget.connect("realize", ()=>{
        const window = preferencesWidget.get_root();
        window.set_title(_("Panel Date Format Configuration"));
        window.default_height = 850;
        window.default_width = 850;
    });
    return preferencesWidget;
}
