import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import sanitizeHtml from 'sanitize-html'

const md = new MarkdownIt({
    html: false,
    linkify: true,
    breaks: false,
    highlight: (str, lang) => {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return (
                    `<pre><code class="hljs language-${lang}">` +
                    hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                    `</code></pre>`
                )
            } catch {
                /* noop */
            }
        }
        return `<pre><code class="hljs">` + md.utils.escapeHtml(str) + `</code></pre>`
    },
})

const sanitize = (dirtyHtml: string) =>
    sanitizeHtml(dirtyHtml, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([
            'img',
            'h1',
            'h2',
            'h3',
            'pre',
            'code',
        ]),
        allowedAttributes: {
            a: ['href', 'name', 'target', 'rel'],
            img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
            code: ['class'],
            '*': ['id'],
        },
        allowedStyles: {},
        transformTags: {
            a: (tagName, attribs) => {
                const href = attribs.href || ''
                const external = /^https?:\/\//i.test(href)
                return {
                    tagName: 'a',
                    attribs: {
                        ...attribs,
                        ...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
                    },
                }
            },
        },
    })

export function renderMarkdown(mdSource: string): string {
    const rawHtml = md.render(mdSource || '')
    const safeHtml = sanitize(rawHtml)

    const minified = safeHtml.replace(/>\s+</g, '><').trim()

    return minified
}
