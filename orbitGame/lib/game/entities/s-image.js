ig.module (
	'game.entities.s-image'
)
.requires (
	'impact.entity'
)
.defines(function() {
	SImage = ig.Entity.extend({
		img: new Image(),
		loaded: false,
		src: null,
		orig_width: 0,
		orig_height: 0,

		init: function(source) {
			this.img = this.img.cloneNode();
			var self = this;
			this.img.onload = function() {
				self.loaded = true;
				self.orig_width = this.width;
				self.orig_height = this.height;
			}
			this.load(source);
		},
		load: function(source) {
			this.img.src = ig.prefix + 'media/' + source;
		},
		draw: function(ctx, x, y, w, h) {
			if (this.loaded) {
				ctx.drawImage(this.img, x, y, w, h);
			}
		},
		drawSelection: function(ctx, x, y, w, h, slice_x, slice_y, slice_w, slice_h) {
			if (this.loaded) {
				ctx.drawImage(this.img, slice_x, slice_y, slice_w, slice_h, x, y, w, h);
			}
		},
		drawTile: function(ctx, x, y, w, h, tile_index, tile_w, tile_h) {
			if (this.loaded) {
				var x_amount = (this.orig_width - (this.orig_width % tile_w)) / tile_w;
				var y_amount = (this.orig_height - (this.orig_height % tile_h)) / tile_w;

				var tile_x = (tile_index % x_amount) * tile_w;
				var tile_y = ((tile_index - (tile_index % x_amount)) / x_amount) * tile_h;

				ctx.drawImage(this.img, tile_x, tile_y, tile_w, tile_h, x, y, w, h);
			}
		}
	});
});