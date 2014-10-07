class ProductRankingSerializer < ApplicationSerializer

  attributes :url
  attributes :name, :pitch, :slug, :stage, :state, :quality, :watchings_count, :last_activity_at

  def url
    product_path(object)
  end

end
