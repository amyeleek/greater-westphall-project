(function(module){

	function renderGraph(graph) {
	  var width = 800, height = 800;
	  var force = d3.layout.force()
	    .charge(-200).linkDistance(30).size([width, height]);

	  //clear out any old graphs
	  d3.select("#graph").selectAll("svg").remove();  

	  var svg = d3.select("#graph").append("svg")
	    .attr("width", "100%").attr("height", "100%")
	    .attr("pointer-events", "all");

	      force.nodes(graph.nodes).links(graph.links).start();

	      var link = svg.selectAll(".link").data(graph.links).enter().append("line").attr("class", "link");

	      var node = svg.selectAll(".node")
	        .data(graph.nodes).enter()
	        .append("circle")
	        .attr("class", d => {
	          return "node " + d.labels[0] + " " + d.properties.type
	        })
	        .attr("r", 10)
	        .call(force.drag);

	      // html title attribute
	      node.append("title")
	        .text(d => {
	          return d.properties.name;
	        });

	      // force feed algo ticks
	      force.on("tick", () => {
	        link.attr("x1", d => {
	          return d.source.x;
	        }).attr("y1", d => {
	          return d.source.y;
	        }).attr("x2", d => {
	          return d.target.x;
	        }).attr("y2", d => {
	          return d.target.y;
	        });

	        node.attr("cx", d => {
	          return d.x;
	        }).attr("cy", d => {
	          return d.y;
	        });
	      });
	}

	function renderNodeInfo(node) {

		$results = $('#results');
		var final = node.properties.released ? node.proeprties.released.low : node.properties.origin;

		//this pretty obviously needs to be way, way more dynamic
		//how about show the info for all the neighbors as well? 
		$results.children('tbody').append('<tr><td>'+ node.properties.name +'</td><td>'+node.properties.type+'</td><td>'+final+'</td></tr>');

		//bring up list of all the data we store about the media - the node, and the nearest neighbours
		//also run a call to Wikipedia to get anything else useful
		//The wikipedia API is ass. Shelving for now. 
		//https://github.com/spencermountain/wtf_wikipedia/
		//consider if we want to store more information, since that's easier to get

	    // $.getJSON("https://en.wikipedia.org/w/api.php?action=query&titles="+node.title+"&prop=revisions&rvprop=content&format=json&callback=?", function(data){
	    // 	console.log(data);
	    // })

	}

	app = {}
	
	//for checking on creation
	app.nodes = [];

	app.searchNode = function(){
		var queryString = $("#search").find("input[name=search]").val(),
			type = $("input[name='type']:checked").val(),
			queryString2 = $("#search").find("input[name=search2]").val();

		//search to find information about one node and pass that to showMedia
		if(queryString2 == ""){
			api.getNodeNeighbors(queryString).then(graph =>{
				renderNodeInfo(graph.nodes[0]);
				renderGraph(graph);
			});
		}else{
			app.showShortestPath(queryString, queryString2);
		}
	}

	//show graph of node and nearest neighbors
	// app.showNodeGraph = function(node){
	// 	api.getNodeNeighbors(node[0].properties.name).then(graph =>{
	// 		renderGraph(graph)
	// 	});
	// }

	app.showFullGraph = function(){
		api.getGraph().then(graph => {
			app.nodes = graph.nodes;
	    	renderGraph(graph)
	    });
	}

	app.showShortestPath = function(name1, name2){
		api.getShortestPath(name1, name2).then(graph => {
			renderGraph(graph);
		});
	}

	module.app = app;
})(window)