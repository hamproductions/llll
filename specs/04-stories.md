# Stories

The stories section presents game story content with correct visual hierarchy using the right image families.

## Image Families

- Story list cards and series/chapter covers use `image_record_monthly_<seriesId>`
- Story part rows use `image_record_monthly_part_<scriptId>`
- Thumbnail accents use `story_thumbnail_<scriptId>`

These three families are distinct and must not be mixed.

## Acceptance Criteria

- Story list page shows series with correct `image_record_monthly_*` cover images
- Series detail page uses `image_record_monthly_*` as the hero image
- Part rows within a series show `image_record_monthly_part_*` images
- Images display at correct aspect ratios without distortion
- No mixed-up image families between series covers and part images
