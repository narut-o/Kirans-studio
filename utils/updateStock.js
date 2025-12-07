import Product from "../models/productModel.js";

async function updateStock(id,quantity){
    const product = await Product.findById(id);
    product.stock -=  quantity;
    await product.save({validateBeforeSave:false});
}
export default updateStock;