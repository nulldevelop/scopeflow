import type { Metadata } from 'next'
import { LegalLayout } from '@/components/shared/LegalLayout'

export const metadata: Metadata = {
  title: 'Política de Cookies · ScopeFlow',
  description:
    'Quais cookies o ScopeFlow utiliza e para quê. Usamos apenas cookies essenciais.',
}

export default function CookiesPage() {
  return (
    <LegalLayout title="Política de Cookies" updatedAt="29 de maio de 2026">
      <p>
        Esta página explica o que são cookies e quais utilizamos no{' '}
        <strong>ScopeFlow</strong>. Nosso princípio é simples: usamos apenas o
        estritamente necessário para a plataforma funcionar.
      </p>

      <h2>1. O que são cookies</h2>
      <p>
        Cookies são pequenos arquivos de texto que um site armazena no seu
        navegador. Eles podem ser <strong>essenciais</strong> (necessários para
        o funcionamento) ou <strong>não essenciais</strong> (publicidade,
        rastreamento, analytics invasivo).
      </p>

      <h2>2. Cookies que utilizamos</h2>
      <p>
        Utilizamos exclusivamente <strong>cookies essenciais</strong>, que não
        exigem consentimento prévio por serem indispensáveis ao serviço:
      </p>
      <ul>
        <li>
          <strong>Sessão de autenticação</strong> — mantêm você conectado com
          segurança após o login (incluindo o login via Google ou GitHub).
        </li>
        <li>
          <strong>Organização ativa</strong> — lembra qual organização você está
          utilizando na plataforma.
        </li>
      </ul>

      <h2>3. O que NÃO utilizamos</h2>
      <ul>
        <li>Cookies de publicidade ou marketing.</li>
        <li>Cookies de rastreamento entre sites.</li>
        <li>
          Para métricas de uso usamos o <strong>Vercel Analytics</strong>, que é{' '}
          <strong>cookieless</strong>: não grava cookies no seu navegador nem
          coleta dados que identifiquem você individualmente.
        </li>
      </ul>

      <h2>4. Como gerenciar cookies</h2>
      <p>
        Você pode bloquear ou apagar cookies nas configurações do seu navegador.
        Observe, porém, que bloquear os cookies essenciais impedirá o login e o
        funcionamento da plataforma.
      </p>

      <h2>5. Mais informações</h2>
      <p>
        Para entender como tratamos seus dados pessoais, consulte nossa{' '}
        <a href="/privacidade">Política de Privacidade</a>. Dúvidas podem ser
        enviadas para{' '}
        <a href="mailto:privacidade@scopeflow.com.br">
          privacidade@scopeflow.com.br
        </a>
        .
      </p>
    </LegalLayout>
  )
}
