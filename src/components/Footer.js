//@flow
import React, { Component } from 'react';
import I18n from 'i18next';
import { Cookies } from 'react-cookie-consent';
import ShareIcon from '@material-ui/icons/Share';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import {livingTheme} from "../lib/corpoLink"

/*
 * Same footer as the landing page (ratnasagara/src/components/Footer.tsx): a brand
 * column, four link columns and a copyright bar. Titles and labels reuse that
 * page's i18n keys so the two sites stay in step — see src/translations/*.json,
 * footer.columns.* and footer.links.*
 *
 * The Resources column is the landing's ratnasagara/src/components/resources.ts
 * (the same links as its header's ☰ menu): `text` is a name that is not translated.
 */

type Props = {
    locale: string,
    hasSyncs: boolean,
}

type State = {
}

// The consent banner (App.js, getGDPRconsent) comes back on its own once its cookie
// is gone, which is what "Cookie Settings" has to do.
const GDPR_COOKIE = "BDRC-GDPR-consent"

const COLUMNS = [
    {
        titleKey: "footer.columns.resources",
        links: [
            { text: "BUDA", href: "/buda" },
            { labelKey: "footer.links.ocr", href: "https://ocr.bdrc.io/uploads" },
            { labelKey: "footer.links.tools", href: "/tools" },
            // BDRC's Substack, under its own name (a title, so not translated)
            { text: "Digital Dharma", href: "https://bdrc.substack.com/" },
        ],
    },
    {
        titleKey: "footer.columns.organization",
        links: [
            { labelKey: "footer.links.ourStory", href: "https://www.bdrc.io/about-us/" },
            { labelKey: "footer.links.geneSmith", href: "https://www.bdrc.io/people/e-gene-smith/" },
            { labelKey: "footer.links.whoWeAre", href: "https://www.bdrc.io/people/" },
            // Programs, News & blog and Partners: from bdrc.io's footer
            { labelKey: "footer.links.programs", href: "https://www.bdrc.io/programs/" },
            { labelKey: "footer.links.news", href: "https://www.bdrc.io/news/" },
            { labelKey: "footer.links.partners", href: "https://www.bdrc.io/partners/" },
            { labelKey: "footer.links.contact", href: "https://www.bdrc.io/contact/" },
        ],
    },
    // bdrc.io's "Support" column
    {
        titleKey: "footer.columns.support",
        links: [
            { labelKey: "footer.links.donate", href: "https://www.bdrc.io/donation/" },
            { labelKey: "footer.links.dharmaProtectors", href: "https://www.bdrc.io/dharma-protectors-circle/" },
            { labelKey: "footer.links.print", href: "https://www.bdrc.io/print/" },
            { labelKey: "footer.links.newsletter", href: "https://bdrc.app.neoncrm.com/np/clients/bdrc/subscribe.jsp?subscription=3" },
        ],
    },
    {
        titleKey: "footer.columns.legal",
        links: [
            { labelKey: "footer.links.privacy", href: "https://www.bdrc.io/privacy-policy/" },
            // Terms of Access hidden until bdrc.io has a page for it (it pointed at "#").
            // { labelKey: "footer.links.terms", href: "" },
            { labelKey: "footer.links.cookies", action: "cookie-settings" },
        ],
    },
]

// bdrc.io's social accounts, the landing's glyphs (24×24 paths). `nudge`: [x, y]
// units to move a glyph that measures centred in its ring but does not look it.
const SOCIAL = [
    {
        key: "facebook",
        href: "https://www.facebook.com/BDRC.io",
        nudge: [0, -1],
        path: "M14 7h3V3h-3c-2.8 0-4.5 1.8-4.5 4.6V10H7v4h2.5v8h4v-8h3l.5-4h-3.5V7.8c0-.5.3-.8.5-.8z",
    },
    {
        key: "linkedin",
        href: "https://www.linkedin.com/company/buddhist-digital-resource-center/",
        nudge: [1, -2],
        path: "M4 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM2.3 9h3.5v12H2.3zM8.8 9h3.3v1.7c.5-.9 1.7-2 3.6-2 3.8 0 4.5 2.5 4.5 5.7V21h-3.5v-5.9c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1v6H8.8z",
    },
    {
        key: "instagram",
        href: "https://www.instagram.com/buddhist_archive/",
        path: "M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.3-3.3a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z",
    },
]

class Footer extends Component<Props,State> {

    constructor(props : Props) {
        super(props);

        this.state = {}
    }

    /** bdrc.io reads ?lang=; this site's own paths do not, nor do the other BDRC
     *  sites (ocr.bdrc.io). The WordPress site also reads ?living=true to serve the
     *  Living Library theme. */
    href(link : Object) {
        if(!/^https?:\/\/(www\.)?bdrc\.io(\/|$)/i.test(link.href)) return link.href
        const lang = this.props.locale === "zh" ? "zh-hans" : this.props.locale
        return livingTheme(link.href + (link.href.includes("?") ? "&" : "?") + "lang=" + lang)
    }

    openCookieSettings() {
        Cookies.remove(GDPR_COOKIE)
        window.location.reload()
    }

    sharePage() {
        const url = window.location.href
        if(navigator.share) navigator.share({ url }).catch(() => {})
        else if(navigator.clipboard) navigator.clipboard.writeText(url)
    }

    renderLink(link : Object) {
        if(link.action === "cookie-settings") return (
            <button key={link.labelKey} type="button" class="ft-link" lang={this.props.locale}
                onClick={this.openCookieSettings.bind(this)}>
                {I18n.t(link.labelKey)}
            </button>
        )

        const external = /^https?:/i.test(link.href)

        return (
            <a key={link.href} class="ft-link" href={this.href(link)} lang={link.text ? undefined : this.props.locale}
                {...external ? { target: "_blank", rel: "noopener noreferrer" } : {}}>
                {link.text || I18n.t(link.labelKey)}
            </a>
        )
    }

    render()
    {
        return (
            <footer id="site-footer" class={!this.props.hasSyncs?"no-syncs":""}>
                <div class="ft-cols">
                    <div class="ft-brand">
                        <a class="ft-lockup" href="/buda">
                            <img alt="BDRC endless knot" src="/logo.svg"/>
                            <span lang={this.props.locale}>{I18n.t("footer.BDRC")}</span>
                            <span className="visually-hidden">Go to homepage</span>
                        </a>
                        <p lang={this.props.locale}>{I18n.t("footer.description")}</p>
                        <div class="ft-social">
                            <button type="button" title={I18n.t("footer.shareAria")}
                                aria-label={I18n.t("footer.shareAria")} onClick={this.sharePage.bind(this)}>
                                <ShareIcon/>
                            </button>
                            <a href="mailto:help@bdrc.io" title={I18n.t("footer.emailAria")}
                                aria-label={I18n.t("footer.emailAria")}>
                                <MailOutlineIcon/>
                            </a>
                            { SOCIAL.map(s => (
                                <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer"
                                    title={I18n.t("footer." + s.key + "Aria")} aria-label={I18n.t("footer." + s.key + "Aria")}>
                                    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
                                        <path d={s.path} transform={s.nudge ? "translate(" + s.nudge[0] + " " + s.nudge[1] + ")" : undefined}/>
                                    </svg>
                                </a>
                            ))}
                        </div>
                    </div>

                    { COLUMNS.map(col => (
                        <div class="ft-col" key={col.titleKey}>
                            <h4 lang={this.props.locale}>{I18n.t(col.titleKey)}</h4>
                            <div class="ft-links">
                                { col.links.map(link => this.renderLink(link)) }
                            </div>
                        </div>
                    ))}
                </div>

                <div class="ft-legal">
                    <p lang={this.props.locale}>{I18n.t("footer.copyright")}</p>
                </div>
           </footer>
        )
    }
}

export default Footer
