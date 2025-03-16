import CryptoJS from 'crypto-js'
export const hash = (str: string) => {
  const hash = CryptoJS.SHA256(str)
  return hash.toString(CryptoJS.enc.Hex)
}
