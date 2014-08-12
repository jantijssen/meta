/** @jsx React.DOM */

jest.dontMock(pathToFile('components/chat_notifications_toggler.js.jsx'));

describe('ChatNotificationsToggler', function() {
  var Toggler = require(pathToFile('components/chat_notifications_toggler.js.jsx'));
  var ChatNotificationsStore = require(pathToFile('stores/chat_notifications_store.js'));
  var chatRooms;

  beforeEach(function() {
    global.localStorage = {};
    global.moment = require.requireActual('moment');
    global.Dispatcher = require(pathToFile('dispatcher.js'));

    chatRooms = {
      foo: {
        updated: moment().unix(),
        last_read_at: 123
      },
      bar: {
        updated: moment().unix(),
        last_read_at: 123
      },
      baz: {
        updated: moment().unix() - 100,
        last_read_at: moment().unix()
      }
    };

    ChatNotificationsStore.mostRecentlyUpdatedChatRoom
      .mockReturnValue(chatRooms.foo);

    ChatNotificationsStore.getChatRooms.mockReturnValue(chatRooms);

    // Not sure if this kind of mock is an antipattern.
    // Having to do this to get tests to pass might suggest that
    // we need to move the getUnreadCount functions to the components
    // rather than keeping them in the store.
    ChatNotificationsStore.getUnreadCount.mockImplementation(function(acknowledgedAt) {
      var count = _.countBy(
        chatRooms,
        function(entry) {
          var updated = entry.updated > entry.last_read_at;

          if (acknowledgedAt) {
            return updated && entry.updated > acknowledgedAt;
          }

          return updated;
        }
      );

      return count.true || 0;
    });
  });

  afterEach(function() {
    global.localStorage = null;
    global.moment = null;
    global.Dispatcher = null;
  });

  it('instantiates a dropdown toggler with default state', function() {
    var toggler = TestUtils.renderIntoDocument(
      <Toggler iconClass="icon icon-bubbles" href="/chat" label="bubbles" />
    );

    expect(toggler.state.chatRooms).toEqual(null);
    expect(toggler.state.acknowledgedAt).toEqual(0);
    expect(toggler.props.title).toEqual('');
  });

  it('acknowledges a click', function() {
    var toggler = TestUtils.renderIntoDocument(
      <Toggler iconClass="icon icon-bubbles" href="/chat" label="bubbles" />
    );

    toggler.acknowledge();

    expect(toggler.state.acknowledgedAt).toBeCloseTo(moment().unix(), 2);
  });

  it('returns the badge count', function() {
    var toggler = TestUtils.renderIntoDocument(
      <Toggler iconClass="icon icon-bubbles" href="/chat" label="bubbles" />
    );

    expect(toggler.badgeCount()).toEqual(2);

    var badge = TestUtils.findRenderedDOMComponentWithClass(
      toggler,
      'indicator-danger'
    ).getDOMNode();

    expect(badge).toBeTruthy();
  });

  it('clears the badge count based on acknowledgedAt', function() {
    var toggler = TestUtils.renderIntoDocument(
      <Toggler iconClass="icon icon-bubbles" href="/chat" label="bubbles" />
    );

    expect(toggler.badgeCount()).toEqual(2);

    toggler.acknowledge();

    expect(toggler.badgeCount()).toEqual(0);
  });
});
