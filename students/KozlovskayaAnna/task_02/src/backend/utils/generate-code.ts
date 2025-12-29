export function generateCode(length = 8) {
    let code = ''

    for (let i = 0; i < length; i++) {
        const digit = Math.floor(Math.random() * 10) // 0–9
        code += digit.toString()
    }

    return Number(code)
}
