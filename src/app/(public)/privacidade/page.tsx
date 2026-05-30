import type { Metadata } from 'next'
import { LegalLayout } from '@/components/shared/LegalLayout'

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description:
    'Como o ScopeFlow coleta, usa e protege seus dados pessoais, em conformidade com a LGPD.',
  alternates: { canonical: '/privacidade' },
}

export default function PrivacidadePage() {
  return (
    <LegalLayout title="Política de Privacidade" updatedAt="29 de maio de 2026">
      <p>
        Esta Política de Privacidade descreve como o <strong>ScopeFlow</strong>{' '}
        ("nós", "plataforma") coleta, utiliza, armazena e protege os dados
        pessoais dos seus usuários, em conformidade com a Lei nº 13.709/2018
        (Lei Geral de Proteção de Dados — LGPD).
      </p>
      <p>
        Ao criar uma conta ou utilizar a plataforma, você concorda com as
        práticas descritas neste documento.
      </p>

      <h2>1. Quem é o controlador dos dados</h2>
      <p>
        O ScopeFlow é o controlador dos dados pessoais relativos à sua conta e
        ao uso da plataforma. Para questões de privacidade, entre em contato
        pelo e-mail{' '}
        <a href="mailto:privacidade@scopeflow.com.br">
          privacidade@scopeflow.com.br
        </a>
        .
      </p>

      <h2>2. Dados que coletamos</h2>
      <ul>
        <li>
          <strong>Dados de cadastro:</strong> nome, e-mail e foto de perfil,
          obtidos quando você se cadastra ou faz login via Google ou GitHub.
        </li>
        <li>
          <strong>Dados de calibragem financeira:</strong> informações que você
          fornece para calcular seu valor/hora (remuneração desejada, custos
          fixos, regime tributário, carga horária, margem e nível de
          senioridade).
        </li>
        <li>
          <strong>Dados dos seus clientes:</strong> informações que você insere
          sobre seus próprios clientes para gerar orçamentos — como nome,
          e-mail, telefone e documento (CPF/CNPJ). Veja a seção 7.
        </li>
        <li>
          <strong>Conteúdo da plataforma:</strong> orçamentos, propostas,
          catálogo de funcionalidades e demais dados que você cria.
        </li>
        <li>
          <strong>Dados de pagamento:</strong> assinaturas e cobranças são
          processadas pelo nosso parceiro de pagamentos (AbacatePay). Não
          armazenamos dados completos de cartão.
        </li>
        <li>
          <strong>Dados de uso agregados:</strong> métricas de acesso por meio
          do Vercel Analytics, que é <strong>cookieless</strong>, não usa
          identificadores persistentes e não coleta dados que identifiquem você
          individualmente.
        </li>
      </ul>

      <h2>3. Como e por que usamos seus dados</h2>
      <ul>
        <li>
          <strong>Para executar o serviço</strong> (base legal: execução de
          contrato): autenticar seu acesso, gerar orçamentos, processar
          assinaturas e disponibilizar as funcionalidades.
        </li>
        <li>
          <strong>Para melhorar a plataforma</strong> (base legal: legítimo
          interesse): entender o uso agregado e aprimorar a experiência.
        </li>
        <li>
          <strong>Para cumprir obrigações legais</strong> (base legal: obrigação
          legal/regulatória): fiscais e contábeis relacionadas a pagamentos.
        </li>
      </ul>

      <h2>4. Cookies</h2>
      <p>
        Utilizamos apenas cookies essenciais ao funcionamento da plataforma (por
        exemplo, manter sua sessão autenticada). Não utilizamos cookies de
        publicidade ou rastreamento. Detalhes na nossa{' '}
        <a href="/cookies">Política de Cookies</a>.
      </p>

      <h2>5. Compartilhamento com terceiros</h2>
      <p>
        Não vendemos seus dados. Compartilhamos dados apenas com prestadores
        necessários à operação, sob obrigações de confidencialidade:
      </p>
      <ul>
        <li>
          <strong>Google e GitHub</strong> — autenticação (login social).
        </li>
        <li>
          <strong>AbacatePay</strong> — processamento de pagamentos.
        </li>
        <li>
          <strong>Vercel</strong> — hospedagem e métricas agregadas.
        </li>
      </ul>

      <h2>6. Armazenamento e segurança</h2>
      <p>
        Adotamos medidas técnicas e organizacionais para proteger seus dados
        contra acesso não autorizado, perda ou alteração. Ainda assim, nenhum
        sistema é 100% seguro, e você também é responsável por manter a
        confidencialidade do seu acesso.
      </p>

      <h2>7. Dados de terceiros inseridos por você</h2>
      <p>
        Ao cadastrar dados de seus clientes (como CPF/CNPJ, e-mail e telefone),
        você atua como <strong>controlador</strong> dessas informações e o
        ScopeFlow atua como <strong>operador</strong>, tratando-as apenas para
        viabilizar os recursos da plataforma. Você é responsável por possuir
        base legal adequada para inserir esses dados e por informar seus
        clientes sobre esse tratamento.
      </p>

      <h2>8. Seus direitos como titular</h2>
      <p>
        Nos termos do art. 18 da LGPD, você pode solicitar a qualquer momento:
        confirmação e acesso aos seus dados, correção, anonimização,
        portabilidade, eliminação, informação sobre compartilhamentos e
        revogação de consentimento. Para exercer esses direitos, escreva para{' '}
        <a href="mailto:privacidade@scopeflow.com.br">
          privacidade@scopeflow.com.br
        </a>
        .
      </p>

      <h2>9. Retenção de dados</h2>
      <p>
        Mantemos seus dados enquanto sua conta estiver ativa ou pelo período
        necessário para cumprir as finalidades descritas e obrigações legais.
        Após esse período, os dados são eliminados ou anonimizados.
      </p>

      <h2>10. Alterações desta política</h2>
      <p>
        Podemos atualizar esta política periodicamente. Mudanças relevantes
        serão comunicadas pelos canais da plataforma. A data da última
        atualização está indicada no topo desta página.
      </p>

      <h2>11. Contato</h2>
      <p>
        Dúvidas sobre privacidade ou sobre o tratamento dos seus dados podem ser
        enviadas para{' '}
        <a href="mailto:privacidade@scopeflow.com.br">
          privacidade@scopeflow.com.br
        </a>
        .
      </p>
    </LegalLayout>
  )
}
