var express = require('express')
var router = express.Router()
const productFunctions = require ('../controllers/productController');
const userFunctions = require ('../controllers/userController');


router.get('/', async function(req,res,next) {
  try {
  productObjects = await productFunctions.fetchProducts();
  const user = req.session.user;
  res.render('pages/products', {
    title: 'Products',
    products: productObjects,
    tags: [],
    animal: "Both",
    user: user
  });
  } catch (error) {
    console.error('Error fetching products: ', error);
  }
});

router.post('/', async (req, res) => {
  const fAnimal = req.body.animal;
  const fTags = req.body.tag;
  console.log('Received request with animal type:', fAnimal); // Log the animal type
  const user = req.session.user;
  try {
    productObjects = await productFunctions.fetchProducts();
    let productObjectsFilteredAnimal = [];
    let productObjectsFiltered = [];
    if(fAnimal == "undefined") {
      productObjectsFilteredAnimal = productObjects;
    }
    else {
      for(i = 0; i < productObjects.length; i++) {
        if(productObjects[i].category == fAnimal || productObjects[i].category == "Both") {
          productObjectsFilteredAnimal.push(productObjects[i]);
        }
      }
    }
    if(fTags == undefined) {
      productObjectsFiltered = productObjectsFilteredAnimal;
      console.log(productObjectsFiltered);
    }
    else if(typeof fTags === "string") {
      for(i = 0; i < productObjectsFilteredAnimal.length; i++) {
        let prodTags = productObjectsFilteredAnimal[i].tags;
        if(prodTags.includes(fTags)) {
          productObjectsFiltered.push(productObjectsFilteredAnimal[i]);
        }
      }
    }
    else{
      for(i = 0; i < productObjectsFilteredAnimal.length; i++) {
        let valid = true;
        let prodTags = productObjectsFilteredAnimal[i].tags;
        let j = 0;
        while(valid && j < fTags.length) {
          if(!(prodTags.includes(fTags[j]))) {
            valid = false;
          }
          j++;
        }
        if(valid) { productObjectsFiltered.push(productObjectsFilteredAnimal[i]); }
      }
    }
    res.render('pages/products', {
      title: 'Products',
      products: productObjectsFiltered,
      tags: fTags,
      animal: fAnimal,
      user: user
    });
  } catch(error){console.error("Error filtering products")}
})

router.post('/:productId', async (req,res,next)=> {
  try {
    if(req.session.user==undefined) { //if user is not logged in
      res.send(
        '<script> alert("Please sign in before shopping"); </script>'+
        '<script> window.location.href = "/pages/login"; </script>'
      );
    }
    else { //if user is logged in
      let user = req.session.user.username;
      let prod = req.params.productId;
      productFunctions.addToCart(user, prod, 1);
      res.redirect('/pages/products');
    }
  } catch (error){
    console.log("Error adding product to cart", error);
  }
});

module.exports = router;
