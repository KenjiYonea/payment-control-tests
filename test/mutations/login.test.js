const request = require('supertest')
const { expect } = require('chai')
const { login } = require('../helpers/login.js')
const loginData = require('../fixtures/login.json')

describe('Mutation - Login', () => {

    let usuarioValido

    before(async () => {

        usuarioValido = {
            email: `kenji.${Date.now()}@email.com`,
            nome: "Kenji Teste",
            senha: "Senha123!"
        }

        const respostaCriacao = await request('http://localhost:4000')
            .post('/graphql')
            .send({
                query: `mutation CriarUsuario($input: CriarUsuarioInput!) {
                    criarUsuario(input: $input) {
                        id
                        email
                        nome
                        ativo
                    }
                }`,
                variables: {
                    input: {
                        email: usuarioValido.email,
                        nome: usuarioValido.nome,
                        senha: usuarioValido.senha,
                        ativo: true
                    }
                }
            })

        expect(respostaCriacao.status).to.equal(200)
        expect(respostaCriacao.body).to.not.have.property('errors')
    })


    it('Deve realizar login com sucesso quando informo credenciais validas', async () => {

        const resposta = await login({
            email: usuarioValido.email,
            senha: usuarioValido.senha
        })

        expect(resposta.status).to.equal(200)
        expect(resposta.body).to.not.have.property('errors')
        expect(resposta.body.data.login).to.have.property('token')
        expect(resposta.body.data.login.token).to.not.be.empty
        expect(resposta.body.data.login.token).to.be.a('string')
    })


    it('Não deve realizar login quando informo credenciais invalidas', async () => {

        const resposta = await login({
            email: usuarioValido.email,
            senha: "SenhaErrada123!"
        })

        expect(resposta.status).to.equal(200)
        expect(resposta.body.errors[0])
            .to.have.property(
                'message',
                'Credenciais inválidas ou usuário inativo.'
            )

        expect(resposta.body.data).to.equal(null)
    })


    it('Não deve realizar login quando o e-mail não for informado', async () => {

        const resposta = await request('http://localhost:4000')
            .post('/graphql')
            .send({
                query: `mutation Login($email: String!, $senha: String!) {
                    login(email: $email, senha: $senha) {
                        token
                    }
                }`,
                variables: {
                    senha: "Senha123!"
                }
            })

        expect(resposta.status).to.equal(400)
        expect(resposta.body).to.have.property('errors')
        expect(resposta.body.errors[0].message)
            .to.include('Variable "$email"')
    })


    it('Não deve realizar login quando a senha não for informada', async () => {

        const resposta = await request('http://localhost:4000')
            .post('/graphql')
            .send({
                query: `mutation Login($email: String!, $senha: String!) {
                    login(email: $email, senha: $senha) {
                        token
                    }
                }`,
                variables: {
                    email: usuarioValido.email
                }
            })

        expect(resposta.status).to.equal(400)
        expect(resposta.body).to.have.property('errors')
        expect(resposta.body.errors[0].message)
            .to.include('Variable "$senha"')
    })


    it('Não deve realizar login quando o usuário estiver inativo', async () => {

        const resposta = await login(loginData.pgats)

        expect(resposta.status).to.equal(200)
        expect(resposta.body).to.have.property('errors')
        expect(resposta.body.errors[0].message)
            .to.equal('Credenciais inválidas ou usuário inativo.')

        expect(resposta.body.data).to.equal(null)
    })
})