import type { Metadata } from 'next'
import { LegalLayout } from '@/components/shared/LegalLayout'

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description: 'Os termos e condições para uso da plataforma ScopeFlow.',
  alternates: { canonical: '/termos' },
}

export default function TermosPage() {
  return (
    <LegalLayout title="Termos de Uso" updatedAt="29 de maio de 2026">
      <p>
        Estes Termos de Uso regulam o acesso e a utilização da plataforma{' '}
        <strong>ScopeFlow</strong>. Ao criar uma conta ou utilizar o serviço,
        você declara que leu e concorda com estes termos.
      </p>

      <h2>1. O serviço</h2>
      <p>
        O ScopeFlow é uma ferramenta de precificação e geração de orçamentos e
        propostas para desenvolvedores, freelancers e agências. Podemos
        adicionar, alterar ou descontinuar funcionalidades a qualquer momento.
      </p>

      <h2>2. Conta e responsabilidade</h2>
      <ul>
        <li>
          Você é responsável pela veracidade dos dados informados e por manter a
          confidencialidade do seu acesso.
        </li>
        <li>
          Você deve ter capacidade legal para contratar e usar a plataforma.
        </li>
        <li>Atividades realizadas na sua conta são de sua responsabilidade.</li>
      </ul>

      <h2>3. Dados de terceiros inseridos por você</h2>
      <p>
        Ao cadastrar dados de seus clientes (como nome, e-mail, telefone e
        CPF/CNPJ), você declara possuir base legal adequada para tratá-los e se
        compromete a usá-los apenas para fins legítimos. Você atua como
        controlador desses dados, e o ScopeFlow como operador, conforme a{' '}
        <a href="/privacidade">Política de Privacidade</a>.
      </p>

      <h2>4. Planos e pagamentos</h2>
      <ul>
        <li>
          Oferecemos planos gratuitos e pagos. Os recursos de cada plano estão
          descritos na plataforma.
        </li>
        <li>
          Pagamentos de planos pagos são processados pelo nosso parceiro
          (AbacatePay) e renovados conforme a periodicidade contratada, até o
          cancelamento.
        </li>
        <li>
          Você pode cancelar a assinatura a qualquer momento; o acesso pago
          permanece até o fim do período já pago.
        </li>
      </ul>

      <h2>5. Uso aceitável</h2>
      <p>É vedado utilizar a plataforma para:</p>
      <ul>
        <li>Atividades ilegais ou que violem direitos de terceiros.</li>
        <li>
          Tentar comprometer a segurança, integridade ou disponibilidade do
          serviço.
        </li>
        <li>Inserir dados de terceiros sem base legal adequada.</li>
      </ul>

      <h2>6. Propriedade intelectual</h2>
      <p>
        A marca, o software e os elementos visuais do ScopeFlow são de nossa
        titularidade. O conteúdo que você cria (orçamentos, propostas, catálogo)
        permanece seu.
      </p>

      <h2>7. Limitação de responsabilidade</h2>
      <p>
        A plataforma é fornecida "no estado em que se encontra". Não garantimos
        que os cálculos e sugestões de preço sejam adequados a todos os casos —
        eles são uma referência, e a decisão final de precificação é sua. Não
        nos responsabilizamos por decisões comerciais tomadas com base na
        ferramenta.
      </p>

      <h2>8. Encerramento</h2>
      <p>
        Você pode encerrar sua conta a qualquer momento. Podemos suspender ou
        encerrar contas que violem estes termos.
      </p>

      <h2>9. Alterações</h2>
      <p>
        Podemos atualizar estes termos periodicamente. Mudanças relevantes serão
        comunicadas pelos canais da plataforma. A data da última atualização
        está indicada no topo desta página.
      </p>

      <h2>10. Contato</h2>
      <p>
        Dúvidas sobre estes termos podem ser enviadas para{' '}
        <a href="mailto:contato@scopeflow.com.br">contato@scopeflow.com.br</a>.
      </p>
    </LegalLayout>
  )
}
