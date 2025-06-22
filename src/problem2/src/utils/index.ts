export const getTokenImage = (token: string) => {
  if (!token) return

  return `https://raw.githubusercontent.com/Switcheo/token-icons/fb46bc40f43b6f7d33e9def966c11b9e7205a9cb/tokens/${token}.svg`;
}