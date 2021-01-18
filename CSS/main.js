const deleteproduct=(btn)=>{
    const productId=btn.parentNode.querySelector('[name=prid]').value;
    const csrf=btn.parentNode.querySelector('[name=_csrf]').value;
    const productElement=btn.closest('article');
    
    //fetch is used for sending requests from the javascript written on the browser
    fetch('/product/'+productId,{
        method:'DELETE',
        headers:{
            'csrf-token':csrf
        }
    }).then(result=>{
        return result.json();
    })
    .then(data=>{
        console.log(data);
        productElement.parentNode.removeChild(productElement);//here we are doing the DOM manipulation to remove the product from the page 
    })
    .catch(err=>{
        console.log(err);
    })
}
