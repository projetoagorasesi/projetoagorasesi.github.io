import type { Metadata } from "next"
import "@fortawesome/fontawesome-free/css/all.min.css"
import "@fontsource/inter/400.css"
import "@fontsource/inter/500.css"
import "@fontsource/inter/600.css"
import "@fontsource/inter/700.css"
import "@fontsource/poppins/400.css"
import "@fontsource/poppins/600.css"
import "@fontsource/poppins/700.css"
import "./globals.css"

export const metadata: Metadata = {
  title: "Projeto Ágora · Escola SESI Ibura",
  description:
    "Projeto de iniciação científica da Escola SESI Ibura: pesquisas sobre a história e o patrimônio do Recife, com artigos, referências, imagens e diário de ações.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="font-inter antialiased">{children}</body>
    </html>
  )
}
