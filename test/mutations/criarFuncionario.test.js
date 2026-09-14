const request = require('supertest')
const { expect } = require('chai')

describe('Mutation - Criar Funcionario', () => {

    let token

    before(async () => {

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
                    senha: "Senha123!"
                }
            })

        token = resposta.body.data.login.token
    })


    it('Deve criar um funcionario quando preencho os campos obrigatórios com dados válidos', async () => {

        let cpf = Date.now().toString().slice(-11)

        const resposta2 = await request('http://localhost:4000')
            .post('/graphql')
            .set('Authorization', `Bearer ${token}`)
            .send({
                query: `mutation CriarFuncionario($input: CriarFuncionarioInput!) {
                    criarFuncionario(input: $input) {
                        id
                        cpf
                        nome
                        salario_base
                        admissao
                        desligamento
                    }
                }`,
                variables: {
                    input: {
                        cpf: cpf,
                        nome: "Funcionario 1000",
                        salario_base: 7500.00,
                        admissao: "2026-01-05",
                        desligamento: ""
                    }
                }
            })

        expect(resposta2.status).to.equal(200)
        expect(resposta2.body.data.criarFuncionario).to.have.property('id')
    })

    it('Não deve criar um funcionario quando não informo o salario base', async () => {

        let cpf = Date.now().toString().slice(-11)

        const resposta3 = await request('http://localhost:4000')
            .post('/graphql')
            .set('Authorization', `Bearer ${token}`)
            .send({
                query: `mutation CriarFuncionario($input: CriarFuncionarioInput!) {
                    criarFuncionario(input: $input) {
                        id
                        cpf
                        nome
                        salario_base
                        admissao
                        desligamento
                    }
                }`,
                variables: {
                    input: {
                        cpf: cpf,
                        nome: "Funcionario 1000",
                        admissao: "2026-01-05",
                        desligamento: ""
                    }
                }
            })

        expect(resposta3.status).to.equal(400)
        expect(resposta3.body).to.have.property('errors')
        expect(resposta3.body.errors[0].message).to.include('Field "salario_base" of required type "Float!" was not provided.')
    })

    it('Não deve criar um funcionario quando a data de desligamento for menor que a data de admissão', async () => {

        let cpf = Date.now().toString().slice(-11)

        const resposta4 = await request('http://localhost:4000')
            .post('/graphql')
            .set('Authorization', `Bearer ${token}`)
            .send({
                query: `mutation CriarFuncionario($input: CriarFuncionarioInput!) {
                    criarFuncionario(input: $input) {
                        id
                        cpf
                        nome
                        salario_base
                        admissao
                        desligamento
                    }
                }`,
                variables: {
                    input: {
                        cpf: cpf,
                        nome: "Funcionario 1000",
                        salario_base: 7500.00,
                        admissao: "2026-01-05",
                        desligamento: "2025-01-05"
                    }
                }
            })

        expect(resposta4.status).to.equal(200)
        expect(resposta4.body).to.have.property('errors')
        expect(resposta4.body.errors[0].message).to.include('Desligamento não pode ser anterior à admissão.')
    })

    it('Não deve criar um novo funcionario quando o CPF ja estiver cadastrado no sistema', async () => {

        let cpf = Date.now().toString().slice(-11)

        const resposta5 = await request('http://localhost:4000')
            .post('/graphql')
            .set('Authorization', `Bearer ${token}`)
            .send({
                query: `mutation CriarFuncionario($input: CriarFuncionarioInput!) {
                    criarFuncionario(input: $input) {
                        id
                        cpf
                        nome
                        salario_base
                        admissao
                        desligamento
                    }
                }`,
                variables: {
                    input: {
                        cpf: cpf,
                        nome: "Funcionario Novo CPF",
                        salario_base: 7500.00,
                        admissao: "2026-01-05",
                        desligamento: ""
                    }
                }
            })

        expect(resposta5.status).to.equal(200)
        expect(resposta5.body).to.not.have.property('errors')
        expect(resposta5.body.data.criarFuncionario).to.have.property('id')

        const resposta6 = await request('http://localhost:4000')
            .post('/graphql')
            .set('Authorization', `Bearer ${token}`)
            .send({
                query: `mutation CriarFuncionario($input: CriarFuncionarioInput!) {
                    criarFuncionario(input: $input) {
                        id
                        cpf
                        nome
                        salario_base
                        admissao
                        desligamento
                    }
                }`,
                variables: {
                    input: {
                        cpf: cpf,
                        nome: "Funcionario com CPF Anterior",
                        salario_base: 7500.00,
                        admissao: "2026-01-05",
                        desligamento: ""
                    }
                }
            })

        expect(resposta6.status).to.equal(200)
        expect(resposta6.body).to.have.property('errors')
        expect(resposta6.body.errors[0].message).to.include('Já existe funcionário com este CPF.')
    })
})