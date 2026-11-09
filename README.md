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
| `/ar/?id=…` | Ver na minha mesa (câmera + giroscópio, girar com o dedo) |
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

`/ar/?id=…` abre a câmera traseira e usa o giroscópio do celular (estilo Pokémon GO), sem instalar nada e sem Google Play Services:

- o prato aparece onde o celular aponta na mesa, em tamanho real aproximado (supõe o celular ~40 cm acima da mesa); “Trazer” recoloca onde o celular aponta;
- **arrastar para os lados gira o prato** (segue o dedo e continua girando com o embalo, como no iOS); **arrastar para cima inclina** para ver de cima;
- girar o celular mantém o prato no lugar; o filtro One Euro tira o tremor do sensor (mais forte em aparelhos sem giroscópio);
- no Chrome Android usa o `RelativeOrientationSensor`; no iPhone, `deviceorientation` com a permissão de movimento;
- no computador mostra o prato em 3D e um QR code para abrir no celular.

Limite: sem ARCore/ARKit o celular não “enxerga” a mesa, então o prato não acompanha se a pessoa andar em volta; para ver os lados, gira-se o prato com o dedo. (Testamos o 8th Wall, que rastreia a mesa pela câmera, mas em celular simples ficou travado e escorregando; foi removido.)

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
