'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slate = require('slate');

var _isomorphicBase = require('isomorphic-base64');

/**
 * Encode a JSON `object` as base-64 `string`.
 *
 * @param {Object} object
 * @return {String}
 */

function encode(object) {
  var string = JSON.stringify(object);
  var encoded = (0, _isomorphicBase.btoa)(encodeURIComponent(string));
  return encoded;
}

/**
 * Decode a base-64 `string` to a JSON `object`.
 *
 * @param {String} string
 * @return {Object}
 */

function decode(string) {
  var decoded = decodeURIComponent((0, _isomorphicBase.atob)(string));
  var object = JSON.parse(decoded);
  return object;
}

/**
 * Deserialize a Value `string`.
 *
 * @param {String} string
 * @return {Value}
 */

function deserialize(string, options) {
  var raw = decode(string);
  var value = _slate.Value.fromJSON(raw, options);
  return value;
}

/**
 * Deserialize a Node `string`.
 *
 * @param {String} string
 * @return {Node}
 */

function deserializeNode(string, options) {
  var _require = require('slate'),
      Node = _require.Node;

  var raw = decode(string);
  var node = Node.fromJSON(raw, options);
  return node;
}

/**
 * Serialize a `value`.
 *
 * @param {Value} value
 * @return {String}
 */

function serialize(value, options) {
  var raw = value.toJSON(options);
  var encoded = encode(raw);
  return encoded;
}

/**
 * Serialize a `node`.
 *
 * @param {Node} node
 * @return {String}
 */

function serializeNode(node, options) {
  var raw = node.toJSON(options);
  var encoded = encode(raw);
  return encoded;
}

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = {
  deserialize: deserialize,
  deserializeNode: deserializeNode,
  serialize: serialize,
  serializeNode: serializeNode
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJlbmNvZGUiLCJvYmplY3QiLCJzdHJpbmciLCJKU09OIiwic3RyaW5naWZ5IiwiZW5jb2RlZCIsImVuY29kZVVSSUNvbXBvbmVudCIsImRlY29kZSIsImRlY29kZWQiLCJkZWNvZGVVUklDb21wb25lbnQiLCJwYXJzZSIsImRlc2VyaWFsaXplIiwib3B0aW9ucyIsInJhdyIsInZhbHVlIiwiZnJvbUpTT04iLCJkZXNlcmlhbGl6ZU5vZGUiLCJyZXF1aXJlIiwiTm9kZSIsIm5vZGUiLCJzZXJpYWxpemUiLCJ0b0pTT04iLCJzZXJpYWxpemVOb2RlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQTs7QUFDQTs7QUFFQTs7Ozs7OztBQU9BLFNBQVNBLE1BQVQsQ0FBZ0JDLE1BQWhCLEVBQXdCO0FBQ3RCLE1BQU1DLFNBQVNDLEtBQUtDLFNBQUwsQ0FBZUgsTUFBZixDQUFmO0FBQ0EsTUFBTUksVUFBVSwwQkFBS0MsbUJBQW1CSixNQUFuQixDQUFMLENBQWhCO0FBQ0EsU0FBT0csT0FBUDtBQUNEOztBQUVEOzs7Ozs7O0FBT0EsU0FBU0UsTUFBVCxDQUFnQkwsTUFBaEIsRUFBd0I7QUFDdEIsTUFBTU0sVUFBVUMsbUJBQW1CLDBCQUFLUCxNQUFMLENBQW5CLENBQWhCO0FBQ0EsTUFBTUQsU0FBU0UsS0FBS08sS0FBTCxDQUFXRixPQUFYLENBQWY7QUFDQSxTQUFPUCxNQUFQO0FBQ0Q7O0FBRUQ7Ozs7Ozs7QUFPQSxTQUFTVSxXQUFULENBQXFCVCxNQUFyQixFQUE2QlUsT0FBN0IsRUFBc0M7QUFDcEMsTUFBTUMsTUFBTU4sT0FBT0wsTUFBUCxDQUFaO0FBQ0EsTUFBTVksUUFBUSxhQUFNQyxRQUFOLENBQWVGLEdBQWYsRUFBb0JELE9BQXBCLENBQWQ7QUFDQSxTQUFPRSxLQUFQO0FBQ0Q7O0FBRUQ7Ozs7Ozs7QUFPQSxTQUFTRSxlQUFULENBQXlCZCxNQUF6QixFQUFpQ1UsT0FBakMsRUFBMEM7QUFBQSxpQkFDdkJLLFFBQVEsT0FBUixDQUR1QjtBQUFBLE1BQ2hDQyxJQURnQyxZQUNoQ0EsSUFEZ0M7O0FBRXhDLE1BQU1MLE1BQU1OLE9BQU9MLE1BQVAsQ0FBWjtBQUNBLE1BQU1pQixPQUFPRCxLQUFLSCxRQUFMLENBQWNGLEdBQWQsRUFBbUJELE9BQW5CLENBQWI7QUFDQSxTQUFPTyxJQUFQO0FBQ0Q7O0FBRUQ7Ozs7Ozs7QUFPQSxTQUFTQyxTQUFULENBQW1CTixLQUFuQixFQUEwQkYsT0FBMUIsRUFBbUM7QUFDakMsTUFBTUMsTUFBTUMsTUFBTU8sTUFBTixDQUFhVCxPQUFiLENBQVo7QUFDQSxNQUFNUCxVQUFVTCxPQUFPYSxHQUFQLENBQWhCO0FBQ0EsU0FBT1IsT0FBUDtBQUNEOztBQUVEOzs7Ozs7O0FBT0EsU0FBU2lCLGFBQVQsQ0FBdUJILElBQXZCLEVBQTZCUCxPQUE3QixFQUFzQztBQUNwQyxNQUFNQyxNQUFNTSxLQUFLRSxNQUFMLENBQVlULE9BQVosQ0FBWjtBQUNBLE1BQU1QLFVBQVVMLE9BQU9hLEdBQVAsQ0FBaEI7QUFDQSxTQUFPUixPQUFQO0FBQ0Q7O0FBRUQ7Ozs7OztrQkFNZTtBQUNiTSwwQkFEYTtBQUViSyxrQ0FGYTtBQUdiSSxzQkFIYTtBQUliRTtBQUphLEMiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmltcG9ydCB7IFZhbHVlIH0gZnJvbSAnc2xhdGUnXG5pbXBvcnQgeyBhdG9iLCBidG9hIH0gZnJvbSAnaXNvbW9ycGhpYy1iYXNlNjQnXG5cbi8qKlxuICogRW5jb2RlIGEgSlNPTiBgb2JqZWN0YCBhcyBiYXNlLTY0IGBzdHJpbmdgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3RcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5mdW5jdGlvbiBlbmNvZGUob2JqZWN0KSB7XG4gIGNvbnN0IHN0cmluZyA9IEpTT04uc3RyaW5naWZ5KG9iamVjdClcbiAgY29uc3QgZW5jb2RlZCA9IGJ0b2EoZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZykpXG4gIHJldHVybiBlbmNvZGVkXG59XG5cbi8qKlxuICogRGVjb2RlIGEgYmFzZS02NCBgc3RyaW5nYCB0byBhIEpTT04gYG9iamVjdGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZ1xuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5cbmZ1bmN0aW9uIGRlY29kZShzdHJpbmcpIHtcbiAgY29uc3QgZGVjb2RlZCA9IGRlY29kZVVSSUNvbXBvbmVudChhdG9iKHN0cmluZykpXG4gIGNvbnN0IG9iamVjdCA9IEpTT04ucGFyc2UoZGVjb2RlZClcbiAgcmV0dXJuIG9iamVjdFxufVxuXG4vKipcbiAqIERlc2VyaWFsaXplIGEgVmFsdWUgYHN0cmluZ2AuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZ1xuICogQHJldHVybiB7VmFsdWV9XG4gKi9cblxuZnVuY3Rpb24gZGVzZXJpYWxpemUoc3RyaW5nLCBvcHRpb25zKSB7XG4gIGNvbnN0IHJhdyA9IGRlY29kZShzdHJpbmcpXG4gIGNvbnN0IHZhbHVlID0gVmFsdWUuZnJvbUpTT04ocmF3LCBvcHRpb25zKVxuICByZXR1cm4gdmFsdWVcbn1cblxuLyoqXG4gKiBEZXNlcmlhbGl6ZSBhIE5vZGUgYHN0cmluZ2AuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZ1xuICogQHJldHVybiB7Tm9kZX1cbiAqL1xuXG5mdW5jdGlvbiBkZXNlcmlhbGl6ZU5vZGUoc3RyaW5nLCBvcHRpb25zKSB7XG4gIGNvbnN0IHsgTm9kZSB9ID0gcmVxdWlyZSgnc2xhdGUnKVxuICBjb25zdCByYXcgPSBkZWNvZGUoc3RyaW5nKVxuICBjb25zdCBub2RlID0gTm9kZS5mcm9tSlNPTihyYXcsIG9wdGlvbnMpXG4gIHJldHVybiBub2RlXG59XG5cbi8qKlxuICogU2VyaWFsaXplIGEgYHZhbHVlYC5cbiAqXG4gKiBAcGFyYW0ge1ZhbHVlfSB2YWx1ZVxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbmZ1bmN0aW9uIHNlcmlhbGl6ZSh2YWx1ZSwgb3B0aW9ucykge1xuICBjb25zdCByYXcgPSB2YWx1ZS50b0pTT04ob3B0aW9ucylcbiAgY29uc3QgZW5jb2RlZCA9IGVuY29kZShyYXcpXG4gIHJldHVybiBlbmNvZGVkXG59XG5cbi8qKlxuICogU2VyaWFsaXplIGEgYG5vZGVgLlxuICpcbiAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbmZ1bmN0aW9uIHNlcmlhbGl6ZU5vZGUobm9kZSwgb3B0aW9ucykge1xuICBjb25zdCByYXcgPSBub2RlLnRvSlNPTihvcHRpb25zKVxuICBjb25zdCBlbmNvZGVkID0gZW5jb2RlKHJhdylcbiAgcmV0dXJuIGVuY29kZWRcbn1cblxuLyoqXG4gKiBFeHBvcnQuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGRlc2VyaWFsaXplLFxuICBkZXNlcmlhbGl6ZU5vZGUsXG4gIHNlcmlhbGl6ZSxcbiAgc2VyaWFsaXplTm9kZVxufVxuIl19