/** @jsx React.DOM */

(function() {
  var BountyList = React.createClass({
    renderBounties: function() {
      if(!this.props.bounties.length) {
        return
      }

      var product = this.props.product

      return this.props.bounties.map(function(bounty) {
        return (
          <BountyListItem bounty={bounty} product={product} valuation={this.props.valuation} />
        )
      }.bind(this))
    },

    // TODO
    renderEmptyState: function() {
    },

    render: function() {
      return (
        <div className="row">
          <div className="col-xs-12">
            {this.renderBounties()}
            {this.renderEmptyState()}
          </div>
        </div>
      )
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = BountyList
  }

  window.BountyList = BountyList
})();
