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
| `/ar/?id=…` | Ver na minha mesa (AR do sistema, ou prévia 3D na câmera) |
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

## Ver na minha mesa

Feito como os cardápios AR do mercado (ARmenu, QReal/Denny's), com o `<model-viewer>`:

- **Celular com AR do sistema** (Android com ARCore, detectado via WebXR; iPhone/iPad com Quick Look): o prato vai para a mesa em **tamanho real** e **fica no lugar** enquanto a pessoa anda em volta. Não usamos o Scene Viewer, que pede para instalar o Google Play Services em celulares sem suporte.
- **Celular sem AR do sistema:** “prévia na câmera” — o prato em 3D por cima da imagem da câmera, sem sensores (nada treme). Gira com o dedo para ver todos os lados e de cima, pinça para aproximar. A tela avisa que o prato acompanha a tela, sem fingir que está preso na mesa.
- **Computador:** prato em 3D + QR code para abrir no celular.

Histórico: testamos modo giroscópio e o 8th Wall (SLAM no navegador); em celular sem ARCore ambos tremiam/escorregavam e foram removidos.

Câmera exige **HTTPS**: teste pelo link do GitHub Pages.

**QR das mesas:** no admin, gere e imprima o QR de cada mesa; ele abre o cardápio já com o número da mesa (`/?mesa=N`).

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
