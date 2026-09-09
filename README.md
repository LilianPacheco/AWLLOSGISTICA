# AWL — site institucional

Site oficial: https://lilianpacheco.github.io/AWLLOSGISTICA/

## Arquivos e publicação

As quatro páginas em HTML, CSS e JavaScript estão em `docs/`. O GitHub Pages já está configurado para publicar a branch `main`, pasta `/docs`. Não há build obrigatório.

```sh
cd docs
python -m http.server 8765 --bind 127.0.0.1
```

## Manutenção

Edite os dados no bloco `AWL_CONFIG` de `docs/js/main.js`. Depois execute na raiz do repositório:

```sh
node docs/tools/sync-config.js
```

Isso mantém HTML, SEO, sitemap e robots alinhados. O formulário prepara uma mensagem no aplicativo de e-mail do visitante; não possui backend. WhatsApp confirmado e configurado.

Fotos tratadas e logo original restaurada estão em `docs/img/`. Preserve o guindaste e o lettering da marca, além da anonimização das imagens. Na galeria, copie um elemento `figure` existente e ajuste arquivos, categoria, legenda e texto alternativo.

O endereço completo é opcional e não aparece no site. Fotografias do antes ainda aguardam registros reais. O conteúdo da versão anterior permanece no histórico Git.
