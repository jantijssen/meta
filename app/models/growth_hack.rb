class GrowthHack

  def self.staff_auto_love(activity)
    if ["Comment", "Post"].include?(activity.verb)
      user = User.staff.sample
      target_entity = activity.subject_type == 'Event' ? activity.target : activity.subject

      return unless target_entity.news_feed_item

      attributes = {
        user_id: user.id, 
        heartable_id: target_entity.news_feed_item.id, 
        heartable_type: "NewsFeedItem"
      }

      unless Heart.exists?(attributes)
        Heart.delay_for(rand(5..10).minutes).create(attributes) 
      end
    end
  end

end
