# Projeto de Criação de Dashboard com IA

Esse projeto é resultado do curso Aceleração: AI Reports com Excel, GPT Agents e Claude Code, oferecido pelo Santander e DIO.

![Logo Santander Bootcamp](https://assets.dio.me/0XjbOY4B8O2AVkaVEylhZZr0_OtikC59t60NSG9SDT8/f:webp/h:120/q:80/L3RyYWNrcy80NGMxZDg4MC03NjVlLTRlM2MtOGZkNS0yNTk1ODQ2ZDhmMzEucG5n)

## Descrição

Esse projeto é um dashboard interativo criado utilizando HTML, CSS, JavaScript, Python e a ferramenta **Antigravity AI**, que utiliza inteligência artificial para auxiliar na criação de dashboards. A proposta do curso é pegar uma base de dados no Excel e tratar ela para que possamos ter uma melhor visualização e entendimento dos dados e conseguir transforma-los em gráficos e tabelas interativas.

_Eu utilizei o **Antigravity IDE** para me auxiliar no desenvolvimento do projeto utilizando o **Claude Opus 4.6** e por possuir apenas a versão Pro do Gemini optei por utilizar o **Gemini 3.1 Pro** quando excedia os tokens do Claude._

![screenshot light mode 1](/material/Screenshot_light_1.png)
![screenshot light mode 2](/material/Screenshot_light_2.png)
_Screenshot da Dashboard no com tema claro._

![screenshot dark mode 1](/material/Screenshot_dark_1.png)
![screenshot dark mode 2](/material/Screenshot_dark_2.png)
_Screenshot da Dashboard com tema escuro._

### <a name="acessar-dashboard"> **[Acessar Dashboard](https://aleussandro.github.io/dashboard-sales-porsche/)**</a> 

## Tecnologias Utilizadas 

- HTML
- CSS
- JavaScript
  - Chart.js
- Python
  - openpyxl
- Antigravity AI


## Projeto

### O que é o projeto

O projeto transforma uma base de dados bruta em um Dashboard dinâmico, permitindo que o usuário, como por exemplo a equipe de vendas da Porsche, tenha uma melhor visualização dos dados de vendas por região, sazonalidade de vendas e modelos mais populares, facilitando uma futura tomada de decisão. 

### Executando o projeto

**Tratamento de dados (Script em Python):**\
O projeto já vem com uma base de dados tratada, mas caso queira executar o script de saneamento:
- Instale as dependências: 
	```bash
  pip install openpyxl
  ```
- Execute o script:
	```bash
  python sanitize_porsche_data.py
  ```

**Visualização do Dashboard:**\
Para visualizar o dashboard você pode clonar o repositório ou clicar em [acessar o Dashboard](#acessar-dashboard).

### O que aprendi

Durante o processo do curso entendi na prática como é o funcionamento de tratamento de dados e como podemos utilizar a inteligência artificial para auxiliar nesse processo removendo boa parte do trabalho manual e repetitivo.\
Utilizando a inteligência artificial para me auxiliar consegui ter uma noção de como é a estrutura dos códigos front-end, scripts (front e back-end), e como é a estrutura do projeto no geral, pois mesmo que estejamos utilizando a IA como auxilio, precisamos revisar os dados e a estrutura do código para que ele seja o mais eficiente possivel e com menos erros possíveis.\
Mesmo tendo conseguido alcançar o objetivo do projeto ainda tenho muito o que aprender, pois o site ainda possui muitos bugs e não está respondendo da forma que eu gostaria, como é um curso de introdução vou utilizar essa experiência para estudar mais sobre as linguagens e tecnologias utilizadas e me preparar para futuros projetos.
