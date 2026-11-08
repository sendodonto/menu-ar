# MENU AR · Casa Nostra

Cardápio digital com pratos em 3D e **realidade aumentada no tamanho real**, pedido pelo celular e área do restaurante. A Casa Nostra é um restaurante fictício de demonstração.

## Rodar

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # testes de preço, quantidade e medidas
npm run build      # gera o site estático em out/
```

## Rotas

| Rota | O que é |
|---|---|
| `/` | Cardápio (aceita `/?mesa=12` no QR code da mesa) |
| `/prato/?id=…` | Detalhes do prato |
| `/ar/?id=…` | Ver na minha mesa (AR) |
| `/pedido/` | Carrinho e envio do pedido |
| `/admin/` | Login da área do restaurante |

## Modo demonstração x Supabase

Sem variáveis de ambiente, o app roda em **modo demonstração**: cardápio, pedidos e arquivos enviados ficam no navegador (localStorage + IndexedDB). Login demo: `admin@casanostra.demo` / `casanostra`.

Para usar Supabase de verdade:

1. Crie um projeto e rode `supabase/schema.sql` e depois `supabase/seed.sql` no SQL Editor.
2. Em Authentication › Providers › Email, **desative o cadastro público** (“Allow new users to sign up”).
3. Crie o usuário do dono em Authentication › Users e libere-o como admin:
   `insert into admins (user_id) select id from auth.users where email = 'dono@restaurante.com';`
4. Preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (`.env.local`, ou variáveis do repositório no GitHub Actions).

Pedidos de clientes entram pela função `create_order`, que lê os preços do banco. Ninguém anônimo lê pedidos.

## Realidade aumentada

Nenhum modo pede para instalar nada:

- **Cartão da mesa** (padrão no Android e em qualquer celular): a câmera reconhece o cartão impresso da Casa Nostra (MindAR, no próprio navegador) e o prato fica preso sobre ele, no tamanho real, enquanto o cliente se move. Rota `/mesa/?id=…&modo=cartao`.
- **Sem cartão** (aproximado): câmera + giroscópio. O prato fica no lugar quando o celular gira, mas não acompanha se o cliente andar. Rota `/mesa/?id=…&modo=giroscopio`.
- **iPhone/iPad:** Quick Look, que já vem no iOS (USDZ gerado a partir do GLB). O cartão também funciona.
- **AR do Google (WebXR):** aparece só como opção extra quando o Chrome diz que suporta, com o aviso de que pode pedir o Google Play Services para RA. O Scene Viewer foi removido porque sempre pedia essa instalação.

**Cartões das mesas:** no admin, em *Cartões das mesas*, escolha as mesas e imprima em 100% (sem “ajustar à página”). A imagem precisa sair com **10 cm de largura**: a escala do prato é calculada a partir dela. O QR de cada cartão abre o cardápio já com a mesa (`/?mesa=N`).

Trocar a arte do cartão: edite `tools/ar/make_card.py`, rode-o e depois `node tools/ar/compile-target.mjs` com um Edge/Chrome usando a GPU de verdade (sob SwiftShader o alvo não é reconhecido).

Câmera exige **HTTPS**: teste pelo link do GitHub Pages.

## Modelos 3D

`public/models/*.glb`, gerados por `tools/models/`:

- `textures.py` pinta as texturas (pizza, risoto, tiramisù, crema);
- `build_models.py` monta os pratos no Blender 4.5 e exporta GLB com Draco, além dos renders usados como foto dos itens escaneados.

| Prato | Origem |
|---|---|
| Torta al cioccolato e fragole, Torta di carote, Cornetto, Prosecco | Escaneamentos reais Poly Haven (CC0) |
| Pizza Margherita, Pizza Diavola, Risotto, Tiramisù, Espresso | Modelados para a demo, marcados como “Modelo 3D demonstrativo” |

O restaurante pode enviar o GLB próprio de cada prato pelo admin.

## Fotos

As fotos dos pratos sem escaneamento são do Unsplash (licença Unsplash) e servem só de ilustração. Troque-as pelas fotos reais do restaurante no admin.
