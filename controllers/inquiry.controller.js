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
        //Pagination info
        const pageSize = 10;
        const page = parseInt(req.query.page) || 1;
        const totalInquiries = await Inquiry.countDocuments();
        const totalPages = Math.ceil(totalInquiries / pageSize);

        const inquiries = await Inquiry.find({})
            .skip(pageSize * (page - 1))
            .limit(pageSize);

        res.json({
            totalPages,
            page,
            inquiries,
        });
    }catch(err){
        res.status(500).send({message: err.message});
    }
}

exports.openInquiry = async(req, res) =>{
    try{
        const inquiry = await Inquiry.findById(req.params.id);
        if(!inquiry){
            res.status(404).send({message: "Inquiry not found"});
        }

        if(!inquiry.opened){
            inquiry.opened = new Date();
            await inquiry.save();
        }
        res.status(200).send({message: "Inquiry opened", inquiry});

    }catch(err){
        res.status(500).send({message: err.message});
    }
}