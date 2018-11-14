// ==UserScript==
// @id             iitc-plugin-highlight-visited-captured-portals
// @name           IITC plugin: highlight visited or captured portals
// @category       Highlighter
// @version        0.0.1
// @description    Use the portal fill color to highlight whether a portal is visited or captured. Visited: orange, Captured: magenta
// @updateURL      https://raw.githubusercontent.com/Hubertzhang/IITC-Scripts/master/UPCV/highlight-visited-captured-portals.meta.js
// @downloadURL    https://raw.githubusercontent.com/Hubertzhang/IITC-Scripts/master/UPCV/highlight-visited-captured-portals.user.js
// @include        https://*.ingress.com/intel*
// @include        http://*.ingress.com/intel*
// @include        https://intel.ingress.com/*
// @include        http://intel.ingress.com/*
// @match          https://*.ingress.com/intel*
// @match          http://*.ingress.com/intel*
// @match          https://intel.ingress.com/*
// @match          http://intel.ingress.com/*
// @include        https://*.ingress.com/mission/*
// @include        http://*.ingress.com/mission/*
// @match          https://*.ingress.com/mission/*
// @match          http://*.ingress.com/mission/*
// @grant          none
// ==/UserScript==


function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
  if(typeof window.plugin !== 'function') window.plugin = function() {
  };

//PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
//(leaving them in place might break the 'About IITC' page or break update checks)

//END PLUGIN AUTHORS NOTE


// PLUGIN START ////////////////////////////////////////////////////////
  
  
  /**
   * k-d Tree JavaScript - V 1.01
   *
   * https://github.com/ubilabs/kd-tree-javascript
   *
   * @author Mircea Pricop <pricop@ubilabs.net>, 2012
   * @author Martin Kleppe <kleppe@ubilabs.net>, 2012
   * @author Ubilabs http://ubilabs.net, 2012
   * @license MIT License <http://www.opensource.org/licenses/mit-license.php>
   */
  
  (function(root, factory) {
    if(typeof define === 'function' && define.amd) {
      define([ 'exports' ], factory);
    } else if(typeof exports === 'object') {
      factory(exports);
    } else {
      factory(root);
    }
  }(this, function(exports) {
    function Node(obj, dimension, parent) {
      this.obj = obj;
      this.left = null;
      this.right = null;
      this.parent = parent;
      this.dimension = dimension;
    }
    
    function kdTree(points, metric, dimensions) {
      
      var self = this;
      
      function buildTree(points, depth, parent) {
        var dim = depth % dimensions.length,
            median,
            node;
        
        if(points.length === 0) {
          return null;
        }
        if(points.length === 1) {
          return new Node(points[ 0 ], dim, parent);
        }
        
        points.sort(function(a, b) {
          return a[ dimensions[ dim ] ] - b[ dimensions[ dim ] ];
        });
        
        median = Math.floor(points.length / 2);
        node = new Node(points[ median ], dim, parent);
        node.left = buildTree(points.slice(0, median), depth + 1, node);
        node.right = buildTree(points.slice(median + 1), depth + 1, node);
        
        return node;
      }
      
      // Reloads a serialied tree
      function loadTree(data) {
        // Just need to restore the `parent` parameter
        self.root = data;
        
        function restoreParent(root) {
          if(root.left) {
            root.left.parent = root;
            restoreParent(root.left);
          }
          
          if(root.right) {
            root.right.parent = root;
            restoreParent(root.right);
          }
        }
        
        restoreParent(self.root);
      }
      
      // If points is not an array, assume we're loading a pre-built tree
      if(!Array.isArray(points)) loadTree(points, metric, dimensions);
      else this.root = buildTree(points, 0, null);
      
      // Convert to a JSON serializable structure; this just requires removing
      // the `parent` property
      this.toJSON = function(src) {
        if(!src) src = this.root;
        var dest = new Node(src.obj, src.dimension, null);
        if(src.left) dest.left = self.toJSON(src.left);
        if(src.right) dest.right = self.toJSON(src.right);
        return dest;
      };
      
      this.insert = function(point) {
        function innerSearch(node, parent) {
          
          if(node === null) {
            return parent;
          }
          
          var dimension = dimensions[ node.dimension ];
          if(point[ dimension ] < node.obj[ dimension ]) {
            return innerSearch(node.left, node);
          } else {
            return innerSearch(node.right, node);
          }
        }
        
        var insertPosition = innerSearch(this.root, null),
            newNode,
            dimension;
        
        if(insertPosition === null) {
          this.root = new Node(point, 0, null);
          return;
        }
        
        newNode = new Node(point, (insertPosition.dimension + 1) % dimensions.length, insertPosition);
        dimension = dimensions[ insertPosition.dimension ];
        
        if(point[ dimension ] < insertPosition.obj[ dimension ]) {
          insertPosition.left = newNode;
        } else {
          insertPosition.right = newNode;
        }
      };
      
      this.remove = function(point) {
        var node;
        
        function nodeSearch(node) {
          if(node === null) {
            return null;
          }
          
          if(node.obj === point) {
            return node;
          }
          
          var dimension = dimensions[ node.dimension ];
          
          if(point[ dimension ] < node.obj[ dimension ]) {
            return nodeSearch(node.left, node);
          } else {
            return nodeSearch(node.right, node);
          }
        }
        
        function removeNode(node) {
          var nextNode,
              nextObj,
              pDimension;
          
          function findMin(node, dim) {
            var dimension,
                own,
                left,
                right,
                min;
            
            if(node === null) {
              return null;
            }
            
            dimension = dimensions[ dim ];
            
            if(node.dimension === dim) {
              if(node.left !== null) {
                return findMin(node.left, dim);
              }
              return node;
            }
            
            own = node.obj[ dimension ];
            left = findMin(node.left, dim);
            right = findMin(node.right, dim);
            min = node;
            
            if(left !== null && left.obj[ dimension ] < own) {
              min = left;
            }
            if(right !== null && right.obj[ dimension ] < min.obj[ dimension ]) {
              min = right;
            }
            return min;
          }
          
          if(node.left === null && node.right === null) {
            if(node.parent === null) {
              self.root = null;
              return;
            }
            
            pDimension = dimensions[ node.parent.dimension ];
            
            if(node.obj[ pDimension ] < node.parent.obj[ pDimension ]) {
              node.parent.left = null;
            } else {
              node.parent.right = null;
            }
            return;
          }
          
          // If the right subtree is not empty, swap with the minimum element on the
          // node's dimension. If it is empty, we swap the left and right subtrees and
          // do the same.
          if(node.right !== null) {
            nextNode = findMin(node.right, node.dimension);
            nextObj = nextNode.obj;
            removeNode(nextNode);
            node.obj = nextObj;
          } else {
            nextNode = findMin(node.left, node.dimension);
            nextObj = nextNode.obj;
            removeNode(nextNode);
            node.right = node.left;
            node.left = null;
            node.obj = nextObj;
          }
          
        }
        
        node = nodeSearch(self.root);
        
        if(node === null) {
          return;
        }
        
        removeNode(node);
      };
      
      this.nearest = function(point, maxNodes, maxDistance) {
        var i,
            result,
            bestNodes;
        
        bestNodes = new BinaryHeap(
          function(e) {
            return -e[ 1 ];
          }
        );
        
        function nearestSearch(node) {
          var bestChild,
              dimension   = dimensions[ node.dimension ],
              ownDistance = metric(point, node.obj),
              linearPoint = {},
              linearDistance,
              otherChild,
              i;
          
          function saveNode(node, distance) {
            bestNodes.push([ node, distance ]);
            if(bestNodes.size() > maxNodes) {
              bestNodes.pop();
            }
          }
          
          for(i = 0; i < dimensions.length; i += 1) {
            if(i === node.dimension) {
              linearPoint[ dimensions[ i ] ] = point[ dimensions[ i ] ];
            } else {
              linearPoint[ dimensions[ i ] ] = node.obj[ dimensions[ i ] ];
            }
          }
          
          linearDistance = metric(linearPoint, node.obj);
          
          if(node.right === null && node.left === null) {
            if(bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[ 1 ]) {
              saveNode(node, ownDistance);
            }
            return;
          }
          
          if(node.right === null) {
            bestChild = node.left;
          } else if(node.left === null) {
            bestChild = node.right;
          } else {
            if(point[ dimension ] < node.obj[ dimension ]) {
              bestChild = node.left;
            } else {
              bestChild = node.right;
            }
          }
          
          nearestSearch(bestChild);
          
          if(bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[ 1 ]) {
            saveNode(node, ownDistance);
          }
          
          if(bestNodes.size() < maxNodes || Math.abs(linearDistance) < bestNodes.peek()[ 1 ]) {
            if(bestChild === node.left) {
              otherChild = node.right;
            } else {
              otherChild = node.left;
            }
            if(otherChild !== null) {
              nearestSearch(otherChild);
            }
          }
        }
        
        if(maxDistance) {
          for(i = 0; i < maxNodes; i += 1) {
            bestNodes.push([ null, maxDistance ]);
          }
        }
        
        if(self.root)
          nearestSearch(self.root);
        
        result = [];
        
        for(i = 0; i < Math.min(maxNodes, bestNodes.content.length); i += 1) {
          if(bestNodes.content[ i ][ 0 ]) {
            result.push([ bestNodes.content[ i ][ 0 ].obj, bestNodes.content[ i ][ 1 ] ]);
          }
        }
        return result;
      };
      
      this.balanceFactor = function() {
        function height(node) {
          if(node === null) {
            return 0;
          }
          return Math.max(height(node.left), height(node.right)) + 1;
        }
        
        function count(node) {
          if(node === null) {
            return 0;
          }
          return count(node.left) + count(node.right) + 1;
        }
        
        return height(self.root) / (Math.log(count(self.root)) / Math.log(2));
      };
    }
    
    // Binary heap implementation from:
    // http://eloquentjavascript.net/appendix2.html
    
    function BinaryHeap(scoreFunction) {
      this.content = [];
      this.scoreFunction = scoreFunction;
    }
    
    BinaryHeap.prototype = {
      push: function(element) {
        // Add the new element to the end of the array.
        this.content.push(element);
        // Allow it to bubble up.
        this.bubbleUp(this.content.length - 1);
      },
      
      pop: function() {
        // Store the first element so we can return it later.
        var result = this.content[ 0 ];
        // Get the element at the end of the array.
        var end = this.content.pop();
        // If there are any elements left, put the end element at the
        // start, and let it sink down.
        if(this.content.length > 0) {
          this.content[ 0 ] = end;
          this.sinkDown(0);
        }
        return result;
      },
      
      peek: function() {
        return this.content[ 0 ];
      },
      
      remove: function(node) {
        var len = this.content.length;
        // To remove a value, we must search through the array to find
        // it.
        for(var i = 0; i < len; i++) {
          if(this.content[ i ] == node) {
            // When it is found, the process seen in 'pop' is repeated
            // to fill up the hole.
            var end = this.content.pop();
            if(i != len - 1) {
              this.content[ i ] = end;
              if(this.scoreFunction(end) < this.scoreFunction(node))
                this.bubbleUp(i);
              else
                this.sinkDown(i);
            }
            return;
          }
        }
        throw new Error("Node not found.");
      },
      
      size: function() {
        return this.content.length;
      },
      
      bubbleUp: function(n) {
        // Fetch the element that has to be moved.
        var element = this.content[ n ];
        // When at 0, an element can not go up any further.
        while(n > 0) {
          // Compute the parent element's index, and fetch it.
          var parentN = Math.floor((n + 1) / 2) - 1,
              parent  = this.content[ parentN ];
          // Swap the elements if the parent is greater.
          if(this.scoreFunction(element) < this.scoreFunction(parent)) {
            this.content[ parentN ] = element;
            this.content[ n ] = parent;
            // Update 'n' to continue at the new position.
            n = parentN;
          }
          // Found a parent that is less, no need to move it further.
          else {
            break;
          }
        }
      },
      
      sinkDown: function(n) {
        // Look up the target element and its score.
        var length    = this.content.length,
            element   = this.content[ n ],
            elemScore = this.scoreFunction(element);
        
        while(true) {
          // Compute the indices of the child elements.
          var child2N = (n + 1) * 2, child1N = child2N - 1;
          // This is used to store the new position of the element,
          // if any.
          var swap = null;
          // If the first child exists (is inside the array)...
          if(child1N < length) {
            // Look it up and compute its score.
            var child1      = this.content[ child1N ],
                child1Score = this.scoreFunction(child1);
            // If the score is less than our element's, we need to swap.
            if(child1Score < elemScore)
              swap = child1N;
          }
          // Do the same checks for the other child.
          if(child2N < length) {
            var child2      = this.content[ child2N ],
                child2Score = this.scoreFunction(child2);
            if(child2Score < (swap == null ? elemScore : child1Score)) {
              swap = child2N;
            }
          }
          
          // If the element needs to be moved, swap it, and continue.
          if(swap != null) {
            this.content[ n ] = this.content[ swap ];
            this.content[ swap ] = element;
            n = swap;
          }
          // Otherwise, we are done.
          else {
            break;
          }
        }
      }
    };
    
    exports.kdTree = kdTree;
    exports.BinaryHeap = BinaryHeap;
  }));

// use own namespace for plugin
  window.plugin.portalHighlighterUPCV = function() {
  };
  
  window.plugin.portalHighlighterUPCV.metric = function(a, b) {
    return Math.pow(a.latE6 - b.latE6, 2) + Math.pow(a.lngE6 - b.lngE6, 2);
  };
  
  window.plugin.portalHighlighterUPCV.load = function() {
    try {
      var upvStr = localStorage[ 'highlight-visited-portals' ];
      if(upvStr !== undefined) {
        var upvData = JSON.parse(upvStr);
        window.plugin.portalHighlighterUPCV.upvedPortals = new kdTree(upvData, window.plugin.portalHighlighterUPCV.metric, [ "latE6", "lngE6" ]);
      }
      
      var upcStr = localStorage[ 'highlight-captured-portals' ];
      if(upcStr !== undefined) {
        var upcData = JSON.parse(upcStr);
        window.plugin.portalHighlighterUPCV.upcedPortals = new kdTree(upcData, window.plugin.portalHighlighterUPCV.metric, [ "latE6", "lngE6" ]);
      }
    } catch(e) {
      console.warn('HighlightUPCV: failed to load data from localStorage: ' + e);
    }
  };
  
  window.plugin.portalHighlighterUPCV.save = function() {
    if(window.plugin.portalHighlighterUPCV.upvedPortals != null) {
      localStorage[ 'highlight-visited-portals' ] = JSON.stringify(window.plugin.portalHighlighterUPCV.upvedPortals.toJSON());
      console.log('HighlightUPCV: upc saved to localStorage');
    }
    if(window.plugin.portalHighlighterUPCV.upcedPortals != null) {
      localStorage[ 'highlight-captured-portals' ] = JSON.stringify(window.plugin.portalHighlighterUPCV.upcedPortals.toJSON());
      console.log('HighlightUPCV: upv saved to localStorage');
    }
    console.log('HighlightUPCV: save completed');
  };
  
  
  window.plugin.portalHighlighterUPCV.import = function(data) {
    var upc_temp = [];
    $.each(data, function(index, item) {
      if(item.upc) {
        upc_temp.push(item);
      }
    });
    window.plugin.portalHighlighterUPCV.upcedPortals = new kdTree(upc_temp, window.plugin.portalHighlighterUPCV.metric, [ "latE6", "lngE6" ]);
    window.plugin.portalHighlighterUPCV.upvedPortals = new kdTree(data, window.plugin.portalHighlighterUPCV.metric, [ "latE6", "lngE6" ]);
  };

// Manual import and reset data
  window.plugin.portalHighlighterUPCV.manualOpt = function() {
    
    var html = '<div class="highlighterUPCVInfobox">'
      + '<a onclick="window.plugin.portalHighlighterUPCV.optPaste();return false;" tabindex="0">Paste Drawn Items</a>'
      + (window.requestFile !== undefined
        ? '<a onclick="window.plugin.portalHighlighterUPCV.optImport();return false;" tabindex="0">Import Drawn Items</a>' : '')
      + '<a onclick="window.plugin.portalHighlighterUPCV.optReset();return false;" tabindex="0">Reset UPCV Data</a>'
      + '</div>';
    
    dialog({
      html       : html,
      id         : 'highlight-visited-captured-portals',
      dialogClass: 'ui-dialog-highlighterUPCVInfobox',
      title      : 'Import UPCV Data'
    });
  };
  
  window.plugin.portalHighlighterUPCV.optAlert = function(message) {
    $('.ui-dialog-highlighterUPCVInfobox .ui-dialog-buttonset').prepend('<p class="hightlightupcv-alert" style="float:left;margin-top:4px;">' + message + '</p>');
    $('.hightlightupcv-alert').delay(2500).fadeOut();
  };
  
  window.plugin.portalHighlighterUPCV.optImport = function() {
    if(window.requestFile === undefined) return;
    window.requestFile(function(filename, content) {
      try {
        var data = JSON.parse(content);
        window.plugin.portalHighlighterUPCV.import(data);
        console.log('HighlightUPCV: reset and imported data');
        window.plugin.portalHighlighterUPCV.optAlert('Import Successful.');
        
        // to write back the data to localStorage
        window.plugin.portalHighlighterUPCV.save();
      } catch(e) {
        console.warn('HighlightUPCV: failed to import data: ' + e);
        window.plugin.portalHighlighterUPCV.optAlert('<span style="color: #f88">Import failed</span>');
      }
    });
  };
  
  window.plugin.portalHighlighterUPCV.optPaste = function() {
    var promptAction = prompt('Press CTRL+V to paste.', '');
    if(promptAction !== null && promptAction !== '') {
      try {
        var data = JSON.parse(promptAction);
        window.plugin.portalHighlighterUPCV.import(data);
        console.log('HighlightUPCV: reset and imported drawn items');
        window.plugin.portalHighlighterUPCV.optAlert('Import Successful.');
        
        // to write back the data to localStorage
        window.plugin.portalHighlighterUPCV.save();
      } catch(e) {
        console.warn('HighlightUPCV: failed to import data: ' + e);
        window.plugin.portalHighlighterUPCV.optAlert('<span style="color: #f88">Import failed</span>');
      }
    }
  };
  
  window.plugin.portalHighlighterUPCV.optReset = function() {
    var promptAction = confirm('Imported UPCV data will be reset, are you sure?', '');
    if(promptAction) {
      delete localStorage[ 'highlight-captured-portals' ];
      delete localStorage[ 'highlight-visited-portals' ];
      window.plugin.portalHighlighterUPCV.upcedPortals = null;
      window.plugin.portalHighlighterUPCV.upvedPortals = null;
      console.log('HighlightUPCV: reset data');
      window.plugin.portalHighlighterUPCV.optAlert('Reset Successful. ');
    }
  };
  
  window.plugin.portalHighlighterUPCV.upcFunc = function(data) {
    if(window.plugin.portalHighlighterUPCV.upcedPortals == null) {
      return;
    }
    var portal = data.portal.options.data;
    
    var node = window.plugin.portalHighlighterUPCV.upcedPortals.nearest(portal, 1, 50);
    
    if(node.length > 0) {
      data.portal.setStyle({ fillColor: 'magenta', fillOpacity: 0.7 });
    }
  };
  
  window.plugin.portalHighlighterUPCV.upvFunc = function(data) {
    if(window.plugin.portalHighlighterUPCV.upvedPortals == null) {
      return;
    }
    var portal = data.portal.options.data;
    
    var node = window.plugin.portalHighlighterUPCV.upvedPortals.nearest(portal, 1, 50);
    
    if(node.length > 0) {
      data.portal.setStyle({ fillColor: 'orange', fillOpacity: 0.7 });
    }
  };
  
  window.plugin.portalHighlighterUPCV.upcvFunc = function(data) {
    
    if(window.plugin.portalHighlighterUPCV.upvedPortals == null) {
      return;
    }
    var portal = data.portal.options.data;
    
    var node = window.plugin.portalHighlighterUPCV.upvedPortals.nearest(portal, 1, 50);
    
    if(node.length > 0) {
      var node1 = window.plugin.portalHighlighterUPCV.upcedPortals.nearest(portal, 1, 50);
      if(node1.length > 0) {
        data.portal.setStyle({ fillColor: 'magenta', fillOpacity: 0.7 });
      } else {
        data.portal.setStyle({ fillColor: 'orange', fillOpacity: 0.7 });
      }
    }
  };
  
  window.plugin.portalHighlighterUPCV.boot = function() {
    window.plugin.portalHighlighterUPCV.upcedPortals = null;
    window.plugin.portalHighlighterUPCV.upvedPortals = null;
    plugin.portalHighlighterUPCV.load();
    $('#toolbox').append('<a onclick="window.plugin.portalHighlighterUPCV.manualOpt();return false;" accesskey="c" title="[c]">Import UPCV Data</a>');
  };
  
  var setup = function() {
    window.addPortalHighlighter('UPCed Portal', window.plugin.portalHighlighterUPCV.upcFunc);
    window.addPortalHighlighter('UPVed Portal', window.plugin.portalHighlighterUPCV.upvFunc);
    window.addPortalHighlighter('UPCed or UPVed Portal', window.plugin.portalHighlighterUPCV.upcvFunc);
    window.plugin.portalHighlighterUPCV.boot();
    $('head').append('<style>' +
      '.highlighterUPCVInfobox > a { display:block; color:#ffce00; border:1px solid #ffce00; padding:3px 0; margin:10px auto; width:80%; text-align:center; background:rgba(8,48,78,.9); }' +
      '</style>');
  };
// PLUGIN END //////////////////////////////////////////////////////////
  
  
  setup.info = plugin_info; //add the script info data to the function as a property
  if(!window.bootPlugins) window.bootPlugins = [];
  window.bootPlugins.push(setup);
// if IITC has already booted, immediately run the 'setup' function
  if(window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end

// inject code into site context
var script = document.createElement('script');
var info = {};
if(typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = {
  version    : GM_info.script.version,
  name       : GM_info.script.name,
  description: GM_info.script.description
};
script.appendChild(document.createTextNode('(' + wrapper + ')(' + JSON.stringify(info) + ');'));
(document.body || document.head || document.documentElement).appendChild(script);


