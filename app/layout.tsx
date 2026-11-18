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
  title: "ÁGORA · Santo Antônio em transformação (1910–1940)",
  description:
    "Projeto de pesquisa da Escola SESI Ibura sobre as mudanças do bairro de Santo Antônio, no Recife, entre 1910 e 1940. Artigos, referências, imagens e diário de ações.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="font-inter antialiased">{children}</body>
    </html>
  )
}
