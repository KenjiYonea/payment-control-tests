const request = require('supertest')
const { expect } = require('chai')
const { login } = require('../helpers/login.js')
const loginData = require('../fixtures/login.json')

describe.only('Mutation - Login', () => {

    it('Deve realizar login com sucesso quando informo credencias validas', async () => {
        const usuario = {
            email: "kenji.@email.com",
            senha: "Senha123!"
        }

        const resposta = await login(usuario)

        expect(resposta.status).to.equal(200)
        expect(resposta.body).to.not.have.property('errors')
        expect(resposta.body.data.login).to.have.property('token')
        expect(resposta.body.data.login.token).to.not.be.empty
        expect(resposta.body.data.login.token).to.be.a('string')
        expect(resposta.body.data.login.token).to.include('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')

    })

    it('Não deve realizar login qunado informo credenciais invalidas', async () => {
        const resposta = await request('http://localhost:4000')
            .post('/graphql')
            .send({
                query: `mutation Login($email: String!, $senha: String!) {
                    login(email: $email, senha: $senha) {
                        token
                    }
                }`,
                variables: {
                    email: "kenji.@email.com",
                    senha: "Senha123456!"
                }
            })

        expect(resposta.status).to.equal(200)
        expect(resposta.body.errors[0]).to.have.property('message', 'Credenciais inválidas ou usuário inativo.')
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
        expect(resposta.body.errors[0].message).to.include('Variable \"$email\" of required type \"String!\" was not provided.')
        expect(resposta.body.errors[0].message).to.include('String!')
        expect(resposta.body.errors[0].message).to.include('was not provided')
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
                    email: "kenji@email.com"
                }
            })

        expect(resposta.status).to.equal(400)
        expect(resposta.body).to.have.property('errors')
        expect(resposta.body.errors[0].message).to.include('Variable "$senha" of required type "String!" was not provided.')
        expect(resposta.body.errors[0].message).to.include('String!')
        expect(resposta.body.errors[0].message).to.include('was not provided')

    })

    it('Não deve realizar login quando o usuário estiver inativo', async () => {

        const resposta = await login(loginData.pgats)

        expect(resposta.status).to.equal(200)
        expect(resposta.body).to.have.property('errors')
        expect(resposta.body.errors[0].message).to.equal('Credenciais inválidas ou usuário inativo.')
        expect(resposta.body.data).to.equal(null)

    })

})