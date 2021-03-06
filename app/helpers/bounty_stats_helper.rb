module BountyStatsHelper

  require 'date'
  require 'csv'

  def avg_bounty_lifespan(startd=nil, endd=nil)
    query = "SELECT avg(closed_at - created_at) AS avg_life FROM wips WHERE wips.type IN ('Task') AND wips.state = 'resolved'"
    if !startd.nil? && !endd.nil?
      startd = startd.to_time
      endd = endd.to_time
      query += " AND (wips.created_at BETWEEN '#{startd}' AND '#{endd}')"
    end
    Wip.connection.execute(query).first
  end

  def created(user_type = nil, history = 4, week_range = 1)
    stat_helper('created', week_range, history, user_type)
  end

  def awarded(user_type = nil, history = 4, week_range = 1)
    stat_helper('awarded', week_range, history, user_type)
  end

  def closed(user_type = nil, history = 4, week_range = 1)
    stat_helper('closed', week_range, history, user_type)
  end

  # TODO: this is not DRY
  def date_helper(history = 4, week_range = 1)
    dates = []
    weeks = history.downto(-1).to_a
    ceiling = weeks.max
    weeks.each do |d|
      silence_stream(STDOUT) do
        if d == -1
          # the current week
          startt = week_range == 1 ? Date.today.beginning_of_week : week_range.week.ago.beginning_of_week
        else
          startt = (d+week_range).week.ago.beginning_of_week.to_date
        end
        dates << startt
      end
    end
    dates
  end

  private

  def filtered_query(query, user_type = nil)
    query = query.select{|t| t.user.username != 'kernel' &&
                     t.product.slug != 'meta'}
    if user_type == 'core'
      query = query.select{|t| t.product.core_team?(t.user)}
    elsif user_type == 'staff'
      query = query.select{|t| t.user.staff?}
    elsif user_type == 'noncore'
      query = query.select{|t| !t.product.core_team?(t.user) && !t.user.staff?}
    end
    query
  end

  # TODO: clean up; this code is hella gross
  # need to cache...only the last row will be new
  def stat_helper(status, week_range = 1, history = 4, user_type = nil)
    results = []
    dates = []
    weeks = history.downto(-1).to_a
    ceiling = weeks.max

    weeks.each do |d|
      silence_stream(STDOUT) do
        if d == -1
          # the current week
          startt = week_range == 1 ? Date.today.beginning_of_week : week_range.week.ago.beginning_of_week
          endt = Time.now
        else
          startt = (d+week_range).week.ago.beginning_of_week
          endt = d.week.ago.beginning_of_week
        end

        query = Task.where(created_at: startt..endt)
                    
        if status == 'awarded'
          query = Task.where(state: :resolved).where(closed_at: startt..endt).select{|x| !x.awards.empty?}
        elsif status == 'closed'
          query = Task.where(state: :resolved).where(closed_at: startt..endt)
        end
        dates << startt
        results << Rails.cache.fetch("#{status}_#{user_type}_#{endt.to_i}_#{history}") do; filtered_query(query, user_type).count.to_f; end
      end
    end
    results
  end

  def array_to_csv(array, headers=nil)
    headers ||= ["Date", "Global", "Core", "Noncore", "Staff"]
    CSV.generate do |csv|
      csv << headers unless headers.nil?
      array.each do |row|
        csv << row
      end
    end
  end

end



