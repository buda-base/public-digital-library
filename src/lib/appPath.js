/*
 * When the app is served under a sub-path (PUBLIC_URL, e.g. /buda),
 * window.location.pathname carries that prefix while react-router's
 * useLocation().pathname does not. Code comparing the raw pathname to route
 * literals ("/", "/search", …) therefore stops matching.
 *
 * appPathname() strips the prefix so those comparisons keep working, at the
 * root as well as under any sub-path.
 */
const PREFIX = (process.env.PUBLIC_URL || "").replace(/\/+$/, "")

/** "/buda" when served under a sub-path, "" at the root. */
export const PUBLIC_PREFIX = PREFIX

export function appPathname(pathname) {
  const p = pathname === undefined ? window.location.pathname : pathname
  if (!PREFIX) return p
  // "/buda" and "/buda/" are both the app root.
  if (p === PREFIX) return "/"
  if (p.startsWith(PREFIX + "/")) return p.slice(PREFIX.length)
  return p
}

/*
 * Paths rendering the home page (HomeCompo). On the shared server root the
 * landing page owns "/", so the home also answers at "/buda" — and code that
 * detects the home by comparing to "/" alone would silently stop working there:
 * searchkit's msearch would return zero hits (empty Recent Acquisitions) and the
 * home info messages would disappear.
 */
export const HOME_PATHS = ["/", "/buda"]

/*
 * Where "home" links point. On the shared server root the landing page answers
 * "/", so sending users there would take them out of this app — hence /buda,
 * which HOME_PATHS keeps recognising as the home. A standalone deployment (the
 * Khmer server, or any install owning "/") can set REACT_APP_HOME_PATH=/.
 */
export const HOME_PATH = process.env.REACT_APP_HOME_PATH || "/buda"

export function isHomePath(pathname) {
  return HOME_PATHS.includes(appPathname(pathname))
}

export default appPathname
