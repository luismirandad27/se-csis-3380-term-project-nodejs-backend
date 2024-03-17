const db = require("../models");
const Inquiry = db.inquiry;

exports.createInquiry = async(req, res) =>{
    const {title, body, email, phone} = req.body;
    try{
        if(!(title && body && email && phone)){
            res.status(400).send("Missing fields!");
        }

        const inquiry = await Inquiry.create({
            title,
            body,
            inquiry_date: new Date(),
            email,
            phone
        });


        res.status(200).send({message: "Inquiry succesfully sent", inquiry})


    }catch(err){
        res.status(500).send({message: err.message});
    }
}

exports.getInquiries = async(req, res) =>{
    try{
        const inquiries = await Inquiry.find({});
        res.status(200).send({inquiries})

    }catch(err){
        res.status(500).send({message: err.message});
    }
}