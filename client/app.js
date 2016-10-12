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
	          return "node " + d.label
	        })
	        .attr("r", 10)
	        .call(force.drag);

	      // html title attribute
	      node.append("title")
	        .text(d => {
	          return d.title;
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

	app = {}

	app.searchNode = function(){
		var queryString = $("#search").find("input[name=search]").val();
		var type = $("input[name='type']:checked").val();

		//search to find information about one node and pass that to showMedia

		api.getNode(type, queryString).then(node =>{
			app.showNodeInfo(node);
			app.showNodeGraph(type, node);
		});
	}

	app.showNodeInfo = function(node) {

		$results = $('#results');
		var node = node[0],
			final = node.released ? node.released.low : node.origin;

		$results.children('tbody').append('<tr><td>'+ node.name +'</td><td>'+node.type+'</td><td>'+final+'</td></tr>');

		//bring up list of all the data we store about the media - the node, and the nearest neighbours
		//also run a call to Wikipedia to get anything else useful
		//The wikipedia API is ass. Shelving for now. 
		//https://github.com/spencermountain/wtf_wikipedia/
		//consider if we want to store more information, since that's easier to get

	    // $.getJSON("https://en.wikipedia.org/w/api.php?action=query&titles="+node.title+"&prop=revisions&rvprop=content&format=json&callback=?", function(data){
	    // 	console.log(data);
	    // })

	}

	//show graph of node and nearest neighbors
	app.showNodeGraph = function(type, node){
		var node = node[0];

		api.getNodeNeighbors(type, node.name).then(graph =>{
			renderGraph(graph)
		});
	}

	app.showFullGraph = function(){
		api.getGraph().then(graph => {
	    	renderGraph(graph)
	    });
	}

	module.app = app;
})(window)