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
| `/ar/?id=…` | Ver na minha mesa (8th Wall SLAM, reserva giroscópio) |
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

`/ar/?id=…` abre a câmera e coloca o prato na mesa, sem instalar nada e sem Google Play Services:

- **Rastreamento de mundo (padrão):** usa o motor SLAM do **8th Wall** (Niantic Spatial), servido de `public/xr/`. O celular entende a mesa pela câmera, então o prato fica **fixo no lugar** enquanto você anda em volta, chega perto ou olha de cima. Arrastar com o dedo move o prato; “Trazer” recoloca onde o celular aponta.
- **Reserva automática:** se o motor não rodar no aparelho, cai no modo câmera + giroscópio (só giro, com filtro anti-tremor).
- No computador, mostra o prato em 3D e um QR code para abrir no celular.

Escala: o 8th Wall supõe o celular a ~40 cm da mesa ao começar, então o tamanho é aproximado.

**Licença do 8th Wall:** o motor é grátis e permite uso comercial, **exceto** em produto cobrado cujo valor venha principalmente dessa função de AR ([XR Engine License Agreement](public/xr/LICENSE.txt), seção 1.2). A tela de AR exibe o crédito exigido (Niantic Spatial, copyright, link da licença e aviso de ausência de garantia). Antes de vender o cardápio AR como produto pago, avalie trocar por uma solução licenciada (ex.: Zappar) ou pelo AR nativo (ARCore/ARKit).

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
