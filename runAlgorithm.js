const express = require('express');
const app = express();
var cors = require('cors');
app.listen(3001, () => console.log('Algorithm-erator started on port 3001'));
app.use(express.json({limit: '1mb'}));

app.use(cors())



app.post("/api/recommend", (request, response) => {
    console.log(request.body);
    const spawn = require('child_process').spawn;
    const algorithm = spawn("python3", ["./algorithm/algorithm.py", "--query_file", "/Users/jonahpaten/Documents/HOTH22/algorithm/sample_query.json", "--class_info_file", "/Users/jonahpaten/Documents/HOTH22/algorithm/class_info.json"]);
/* python3 algorithm.py --class_info_file <path to class info json file> --query_file <path to query json file> --output_file <path to output json file>*/
    algorithm.stdout.on("data", (data) =>{
        response.json(data.toString());
        console.log(data.toString());
        
    })

});

