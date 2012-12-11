
# TODO
* More fine-grained events and ability to effect the results.
  * before xrequire -- before begin scans
  * before filter -- before applying filter
  * before require -- before require()
  * after require -- after require()
  * after map -- after map()
  * after inflect -- after inflect()
  * after xrequire -- all files finished
* Ability to only require after a getter call has been attempted on the exported object
  * Avoids some circular dependencies issue

