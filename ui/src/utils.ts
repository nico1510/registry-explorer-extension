const DEFAULT_DOMAIN = "registry-1.docker.io"
const LEGACY_DEFAULT_DOMAIN = "index.docker.io"
const OFFICAL_REPO_NAME = "library"

export function splitDockerDomain(name: string) {
    const i = name.indexOf("/")
    const firstPart = name.substring(0, i)
    let domain, remainder
    if(i === -1 || (!firstPart.includes(".") && !firstPart.includes(":") && firstPart !== "localhost")) {
        domain = DEFAULT_DOMAIN
        remainder = name
    } else {
        domain = firstPart
        remainder = name.substring(i + 1)
    }
    if(domain === LEGACY_DEFAULT_DOMAIN)  {
        domain = DEFAULT_DOMAIN
    }
    if(domain === DEFAULT_DOMAIN && !remainder.includes("/")) {
        remainder = OFFICAL_REPO_NAME + "/" + remainder
    }
    return {domain, remainder}
}
