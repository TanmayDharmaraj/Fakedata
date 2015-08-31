var express = require('express');
var router = express.Router();

//Data Types
router.get('/data-types', function (req, res) {
	var data = [
		{ DataType: "Integer", Symbol: "INT" },
		{ DataType: "Float", Symbol: "FLT" },
		{ DataType: "First Name", Symbol: "FN" },
		{ DataType: "Boolean", Symbol: "BOOL" },
		{ DataType: "Last Name", Symbol: "LN" },
		{ DataType: "Gender", Symbol: "GDR" },
		{ DataType: "Birthday", Symbol: "BD" },
		{ DataType: "Phone", Symbol: "PHN" },
		{ DataType: "Zip", Symbol: "ZIP" },
		{ DataType: "Word", Symbol: "WRD" },
		{ DataType: "Paragraph", Symbol: "PARA" },
		{ DataType: "Coordinates", Symbol: "CORD" }
	];
	res.json(data);
})

module.exports = router;