/**
 * @jsx React.DOM
 *
 *= require models/user
 */

var MembersView = React.createClass({

  getInitialState: function() {
    return {
      members: {}
    }
  },

  render: function() {
    return (
      <div className="">
      {
        _.map(this.sortedMembers(), function(member) {

          var classes = React.addons.classSet({
            'text-weight-bold': member.online,
            'text-emphasis text-muted': !member.online
          })

          if(member.online) {
            var marker = (<span className="indicator indicator-success">&nbsp;</span>)
          } else {
            var marker = (<span className="indicator indicator-default">&nbsp;</span>)
          }

          return (
            <div>
              <a className={classes} href={member.url} key={member.id}>
                <div className="pull-right">
                {marker}
                </div>
                @{member.username}
              </a>
            </div>
          )
        })
      }
      </div>
    )
  },

  addMember: function(member) {
    console.log('adding', member)
    update = {}
    update[member.id] = {'$set': member}

    this.setState(React.addons.update(this.state, {members: update}))
  },

  sortedMembers: function() {
    console.log('members', this.state.members)
    return _.sortBy(_.values(this.state.members), function(member) {
      return (member.online ? '0' : '1') + member.username;
    })
  }
})
