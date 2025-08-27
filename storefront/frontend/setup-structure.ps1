New-Item public\css\bootstrap.min.css -ItemType File
New-Item public\css\font-awesome.min.css -ItemType File
New-Item public\css\nouislider.min.css -ItemType File
New-Item public\css\slick-theme.css -ItemType File
New-Item public\css\slick.css -ItemType File
New-Item public\js\bootstrap.min.js -ItemType File
New-Item public\js\jquery.min.js -ItemType File
New-Item public\js\jquery.zoom.min.js -ItemType File
New-Item public\js\main.js -ItemType File
New-Item public\js\nouislider.min.js -ItemType File
New-Item public\js\slick.min.js -ItemType File
mkdir public\img
mkdir public\fonts

mkdir src\components
New-Item src\components\Header.jsx -ItemType File
New-Item src\components\Footer.jsx -ItemType File
New-Item src\components\ProductCard.jsx -ItemType File
New-Item src\components\Navbar.jsx -ItemType File
New-Item src\components\HeroSection.jsx -ItemType File

mkdir src\pages
New-Item src\pages\Home.jsx -ItemType File
New-Item src\pages\ProductDetail.jsx -ItemType File
New-Item src\pages\Category.jsx -ItemType File
New-Item src\pages\Checkout.jsx -ItemType File

mkdir src\services
New-Item src\services\productService.js -ItemType File

mkdir src\utils
New-Item src\utils\priceFormatter.js -ItemType File

New-Item src\App.jsx -ItemType File
New-Item src\main.jsx -ItemType File
