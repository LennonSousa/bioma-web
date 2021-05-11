import { NextSeo } from 'next-seo';
import { Container } from 'react-bootstrap';

export default function Home() {
  return (
    <>
      <NextSeo title="Plataforma de gerenciamento." />
      <Container className="content-page">
        <h1>Hello world!</h1>
      </Container>
    </>
  )
}
