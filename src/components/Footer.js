//@flow
import React, { Component } from 'react';
import I18n from 'i18next';
import { Cookies } from 'react-cookie-consent';
import ShareIcon from '@material-ui/icons/Share';
import MailOutlineIcon from '@material-ui/icons/MailOutline';

/*
 * Same footer as the landing page (ratnasagara/src/components/Footer.tsx): a brand
 * column, three link columns and a copyright bar. Titles and labels reuse that
 * page's i18n keys so the two sites stay in step — see src/translations/*.json,
 * footer.columns.* and footer.links.*
 *
 * The two links the landing page still has to settle with the team ("Librarian
 * Resources", "Terms of Access") point at "#" there as well; they are kept here so
 * the columns match, and are the two to fill in on both sides at once.
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
            { labelKey: "footer.links.readingRoom", href: "/reading" },
            { labelKey: "footer.links.apiDocs", href: "https://github.com/buda-base/" },
            { labelKey: "footer.links.librarian", href: "#" }, // TODO: à définir avec l'équipe
            { labelKey: "footer.links.etexts", href: "/osearch/search?etext_access%5B0%5D=3" },
        ],
    },
    {
        titleKey: "footer.columns.organization",
        links: [
            { labelKey: "footer.links.ourStory", href: "https://www.bdrc.io/about-us/" },
            { labelKey: "footer.links.geneSmith", href: "https://www.bdrc.io/people/e-gene-smith/" },
            { labelKey: "footer.links.whoWeAre", href: "https://www.bdrc.io/people/" },
            { labelKey: "footer.links.contact", href: "https://www.bdrc.io/contact/" },
        ],
    },
    {
        titleKey: "footer.columns.legal",
        links: [
            { labelKey: "footer.links.privacy", href: "https://www.bdrc.io/privacy-policy/" },
            { labelKey: "footer.links.terms", href: "#" }, // TODO: à définir avec l'équipe
            { labelKey: "footer.links.cookies", action: "cookie-settings" },
        ],
    },
]

class Footer extends Component<Props,State> {

    constructor(props : Props) {
        super(props);

        this.state = {}
    }

    /** bdrc.io reads ?lang=; this site's own paths do not. */
    href(link : Object) {
        if(!/(^|\/\/|\.)bdrc\.io/i.test(link.href)) return link.href
        const lang = this.props.locale === "zh" ? "zh-hans" : this.props.locale
        return link.href + (link.href.includes("?") ? "&" : "?") + "lang=" + lang
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
            <a key={link.labelKey} class="ft-link" href={this.href(link)} lang={this.props.locale}
                {...external ? { target: "_blank", rel: "noopener noreferrer" } : {}}>
                {I18n.t(link.labelKey)}
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
